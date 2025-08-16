import dynamic from "next/dynamic";

const JobFlowApp = dynamic(() => import("./jobflow/JobFlowApp"), { ssr: false });

export default function Page() {
  return (
    <main className="min-h-screen">
      <JobFlowApp />
    </main>
  );
}
