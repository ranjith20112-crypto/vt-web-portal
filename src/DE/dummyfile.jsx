import React from 'react';

const DummyTestModule = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center">
                <h1 className="text-3xl font-bold text-green-600 mb-4">
                    Dummy Test Module
                </h1>

                <p className="text-gray-600 mb-4">
                    If you can see this page, the route is working.
                </p>

                <div className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium">
                    Module Sync Test Successful 🚀
                </div>
            </div>
        </div>
    );
};

export default DummyTestModule;