import React from "react";

const ElectionsOverviewPage: React.FC = () => {
  return (
    <section className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 px-5 py-8 text-center">
      <h2 className="text-xl font-semibold text-blue-900">Select a Service</h2>
      <p className="mt-2 text-sm text-blue-800">
        Choose a card above to open the corresponding elections workflow page.
      </p>
    </section>
  );
};

export default ElectionsOverviewPage;
