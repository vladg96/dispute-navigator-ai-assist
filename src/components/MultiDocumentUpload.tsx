
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Clock,
  Download
} from 'lucide-react';
import { IntegrailService, DocumentProcessingResult, MultiDocumentResult } from '@/services/integrailService';
import { useToast } from '@/components/ui/use-toast';

interface MultiDocumentUploadProps {
  onProcessingComplete: (result: MultiDocumentResult) => void;
  maxFiles?: number;
  acceptedFileTypes?: string[];
}

export const MultiDocumentUpload: React.FC<MultiDocumentUploadProps> = ({
  onProcessingComplete,
  maxFiles = 5,
  acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.webp']
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState<DocumentProcessingResult[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelection = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    // Validate file types
    const invalidFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return !acceptedFileTypes.includes(extension);
    });

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file types",
        description: `Supported formats: ${acceptedFileTypes.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Files too large",
        description: "Maximum file size is 5MB per file",
        variant: "destructive"
      });
      return;
    }

    setSelectedFiles(files);
    setProcessingResults([]);
  }, [maxFiles, acceptedFileTypes, toast]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const startProcessing = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setOverallProgress(0);
    
    // Initialize processing results
    const initialResults = selectedFiles.map(file => ({
      fileName: file.name,
      status: 'processing' as const
    }));
    setProcessingResults(initialResults);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setOverallProgress(prev => Math.min(prev + 5, 95));
      }, 1000);

      const result = await IntegrailService.processMultipleDocuments(selectedFiles);
      
      clearInterval(progressInterval);
      setOverallProgress(100);
      setProcessingResults(result.results);
      
      const successCount = result.results.filter(r => r.status === 'success').length;
      
      toast({
        title: "Processing Complete",
        description: `${successCount} of ${selectedFiles.length} documents processed successfully`,
        variant: successCount > 0 ? "default" : "destructive"
      });

      onProcessingComplete(result);
      
    } catch (error) {
      console.error('Multi-document processing failed:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      
      // Update all results to failed
      setProcessingResults(selectedFiles.map(file => ({
        fileName: file.name,
        status: 'failed',
        error: 'Processing failed'
      })));
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFiles, onProcessingComplete, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-400 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-600';
      case 'failed':
        return 'bg-red-600';
      case 'processing':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Multi-Document Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Selection */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-400 mb-2">
              Upload up to {maxFiles} documents for parallel processing
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Supported formats: {acceptedFileTypes.join(', ')} (max 5MB each)
            </p>
            <input
              type="file"
              multiple
              accept={acceptedFileTypes.join(',')}
              onChange={handleFileSelection}
              className="hidden"
              id="multi-file-input"
              disabled={isProcessing}
            />
            <label htmlFor="multi-file-input">
              <Button 
                variant="outline" 
                className="cursor-pointer bg-slate-700 text-white hover:bg-slate-600"
                disabled={isProcessing}
              >
                Choose Files
              </Button>
            </label>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Files ({selectedFiles.length})</p>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-400">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  {!isProcessing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0 hover:bg-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processing Controls */}
        {selectedFiles.length > 0 && (
          <div className="space-y-4">
            <Button
              onClick={startProcessing}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing Documents...' : 'Start Processing'}
            </Button>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            )}
          </div>
        )}

        {/* Processing Results */}
        {processingResults.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Processing Results</p>
            {processingResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <span className="text-sm">{result.fileName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                  {result.error && (
                    <span className="text-xs text-red-400" title={result.error}>
                      Error
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {/* Summary */}
            {!isProcessing && (
              <div className="bg-slate-700 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">Summary</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-green-400">
                    Success: {processingResults.filter(r => r.status === 'success').length}
                  </span>
                  <span className="text-red-400">
                    Failed: {processingResults.filter(r => r.status === 'failed').length}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
