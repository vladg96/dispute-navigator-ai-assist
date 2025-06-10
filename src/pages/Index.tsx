
import HelloWorld from "@/components/HelloWorld";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-2xl mx-auto">
        <HelloWorld />
        <div className="text-center mt-8">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Your App</h2>
          <p className="text-muted-foreground">Your React application is now running successfully!</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
