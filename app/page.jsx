import TeamDivider from "@/components/team-divider";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <TeamDivider />
      </div>
      <footer className="text-center pt-4 mt-auto h-full">
        <p className="text-sm text-gray-500">
          Made with ❤️ by{" "}
          <a
            href="https://www.instagram.com/shubham.kalaria?igsh=YmRxZHpjNmxyYWJ0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Shubham Kalaria
          </a>
        </p>
        <p className="text-sm text-gray-500">
          v{process.env.NEXT_PUBLIC_APP_VERSION}
        </p>
      </footer>
    </main>
  );
}
