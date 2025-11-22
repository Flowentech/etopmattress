import Link from "next/link";
import React from "react";

const ScheduleButton = ({text}:{text?:string}) => {
  return (
    <Link
      className="bg-primary hover:bg-green-700 text-white px-8 py-3 cursor-pointer rounded-lg"
      href={process.env.NEXT_PUBLIC_CALENDY || ""}
      target="_blank"
      rel="noopener noreferrer"
    >
      {text || "Schedule a Consultation"}
    </Link>
  );
};

const ContactUsButton = ({text,link}:{text?:string,link:string}) => {
  return (
    <Link
      className="bg-primary hover:bg-green-700 text-white px-8 py-3 cursor-pointer rounded-lg"
      href={link}
      target="_blank"
      rel="noopener noreferrer"
    >
      {text || "Schedule a Consultation"}
    </Link>
  );
};

export { ScheduleButton, ContactUsButton };
