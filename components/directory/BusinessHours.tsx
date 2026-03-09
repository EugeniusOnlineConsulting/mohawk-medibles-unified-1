"use client";

interface BusinessHoursProps {
    hours: {
        dayOfWeek: number;
        openTime?: string | null;
        closeTime?: string | null;
        isClosed: boolean;
    }[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function BusinessHours({ hours }: BusinessHoursProps) {
    const today = new Date().getDay();
    
    // Sort hours by day of week starting from today
    const sortedHours = [...hours].sort((a, b) => {
        const dayA = (a.dayOfWeek - today + 7) % 7;
        const dayB = (b.dayOfWeek - today + 7) % 7;
        return dayA - dayB;
    });

    const formatTime = (time?: string | null) => {
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <div className="space-y-2">
            {sortedHours.map((hour) => {
                const isToday = hour.dayOfWeek === today;
                return (
                    <div
                        key={hour.dayOfWeek}
                        className={`flex justify-between text-sm ${
                            isToday ? "font-semibold text-emerald-700" : "text-muted-foreground"
                        }`}
                    >
                        <span>
                            {DAYS[hour.dayOfWeek]}
                            {isToday && (
                                <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                                    Today
                                </span>
                            )}
                        </span>
                        <span>
                            {hour.isClosed ? (
                                <span className="text-red-500">Closed</span>
                            ) : (
                                <span>
                                    {formatTime(hour.openTime)} - {formatTime(hour.closeTime)}
                                </span>
                            )}
                        </span>
                    </div>
                );
            })}
            
            {hours.length === 0 && (
                <p className="text-muted-foreground text-sm">Hours not available</p>
            )}
        </div>
    );
}

export default BusinessHours;
