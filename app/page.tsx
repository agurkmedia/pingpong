import PingPongFeeder from '../components/PingPongFeeder';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <h1 className="text-4xl font-bold mb-8 text-white text-center">
        World's Most Advanced<br />Ping Pong Ball Feeder System
      </h1>
      <PingPongFeeder />
    </main>
  );
}
