import React from "react";

function CustomModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-700 bg-opacity-50">
      <div className="bg-white p-8 rounded-md">
        <p className="text-lg font-bold mb-4">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomModal;
