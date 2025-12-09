import Image from "next/image";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
                <Image
                    src="/innovaport-logo.png"
                    alt="InnovaPort"
                    width={400}
                    height={120}
                    className="h-32 w-auto object-contain mb-8"
                    priority
                />
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
                    {children}
                </div>
            </div>
        </div>
    );
}
