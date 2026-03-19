import React from "react";
import { Headset, PhoneCall } from "lucide-react";

const ControlRoomPage: React.FC = () => {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100">
          <Headset className="h-5 w-5 text-cyan-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Control Room</h2>
          <p className="mt-1 text-sm text-gray-600">
            Reach the district election control room for urgent support.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="mt-5 inline-flex items-center rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700"
      >
        <PhoneCall className="mr-2 h-4 w-4" />
        9876543210
      </button>
    </section>
  );
};

export default ControlRoomPage;
