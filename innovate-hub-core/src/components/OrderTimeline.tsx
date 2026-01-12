import React from 'react';
import { CheckCircle, Truck, Package, Clock, XCircle } from 'lucide-react';

interface OrderTimelineProps {
    status: string;
    createdAt?: string;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, createdAt }) => {
    
    // Normalize status
    const normalizedStatus = status.toUpperCase();

    const steps = [
        { 
            id: 'PENDING', 
            label: 'Order Placed', 
            icon: Package,
            time: createdAt ? new Date(createdAt).toLocaleString() : ''
        },
        { 
            id: 'PROCESSING', 
            label: 'Processing', 
            icon: Clock,
            time: normalizedStatus === 'PROCESSING' || normalizedStatus === 'SHIPPED' || normalizedStatus === 'DELIVERED' ? 'Confirmed' : ''
        },
        { 
            id: 'SHIPPED', 
            label: 'Out for Delivery', 
            icon: Truck,
            time: normalizedStatus === 'SHIPPED' || normalizedStatus === 'DELIVERED' ? 'On the way' : ''
        },
        { 
            id: 'DELIVERED', 
            label: 'Delivered', 
            icon: CheckCircle,
            time: normalizedStatus === 'DELIVERED' ? 'Completed' : ''
        }
    ];

    let currentStepIndex = 0;
    if (normalizedStatus === 'PROCESSING') currentStepIndex = 1;
    if (normalizedStatus === 'SHIPPED') currentStepIndex = 2;
    if (normalizedStatus === 'DELIVERED') currentStepIndex = 3;
    if (normalizedStatus === 'CANCELLED') currentStepIndex = -1; // Handle differently

    if (normalizedStatus === 'CANCELLED') {
        return (
            <div className="flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-lg gap-2">
                <XCircle size={20} />
                <span className="font-semibold">Order Cancelled</span>
            </div>
        )
    }

    return (
        <div className="w-full py-4 px-2">
            <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                <div 
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 -z-10 transition-all duration-500"
                    style={{ width: `${((currentStepIndex) / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center bg-white px-2 z-10">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isActive
                                    ? 'bg-green-100 border-green-500 text-green-600'
                                    : 'bg-gray-50 border-gray-300 text-gray-400'
                            }`}>
                                <StepIcon size={16} />
                            </div>
                            <p className={`text-[10px] md:text-xs font-semibold mt-2 ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                                {step.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTimeline;
