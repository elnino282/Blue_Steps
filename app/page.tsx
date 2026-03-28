import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Trophy, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            B
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">BlueStep</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="rounded-full">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            <span>Gamify your learning journey</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
            Step up your game. <br />
            <span className="text-primary">Beat procrastination.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            BlueStep turns your daily attendance and study habits into a rewarding game. 
            Earn XP, maintain streaks, unlock badges, and stay motivated.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto">
                Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-3xl bg-card border shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Daily Check-ins</h3>
              <p className="text-muted-foreground">Log your attendance and study sessions to build consistency.</p>
            </div>
            <div className="p-6 rounded-3xl bg-card border shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Earn Rewards</h3>
              <p className="text-muted-foreground">Gain XP, level up, and unlock exclusive badges for your achievements.</p>
            </div>
            <div className="p-6 rounded-3xl bg-card border shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Stay Motivated</h3>
              <p className="text-muted-foreground">Receive gentle, positive encouragement to keep you on track.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
