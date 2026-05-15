import { MapPin, Star } from "lucide-react";

interface ChatPayload {
  type:
    | "text"
    | "error"
    | "greeting"
    | "providers"
    | "categories"
    | "businessTypes";
  message?: string;
  items?: any[];
}

interface MessageRendererProps {
  payload: ChatPayload;
  sender: "user" | "ai";
  sendMessage: (text: string) => void;
}

const businessTypeConfig: Record<
  string,
  { image: string; label?: string; description?: string; button: string }
> = {
  home_services: {
    image:
      "https://res.cloudinary.com/dhadohg2h/image/upload/v1778620808/home_service_vwom7w.png",
    label: "Home Services",
    description: "Repairs, cleaning, plumbing & more",
    button: "Explore Services",
  },
  ecommerce: {
    image:
      "https://res.cloudinary.com/dhadohg2h/image/upload/v1778621618/e_commerce_rtn7v8.png",
    label: "E-Commerce",
    description: "Find products, Explore stores,",
    button: "Start Shopping",
  },
};

const categoryConfig: Record<
  string,
  { image: string; label: string; description: string }
> = {
  plumber: {
    image:
      "https://res.cloudinary.com/dhadohg2h/image/upload/v1778674838/plumber_gb91ql.png",
    label: "Plumber",
    description: "Leaks, pipes & drainage",
  },
  // electrician: {
  //   icon: "ti-bolt",
  //   description: "Wiring, panels & repairs",
  //   color: "#FAEEDA",
  //   iconColor: "#854F0B",
  // },
  // cleaner: {
  //   icon: "ti-sparkles",
  //   description: "Deep & regular cleaning",
  //   color: "#EAF3DE",
  //   iconColor: "#3B6D11",
  // },
  // carpenter: {
  //   icon: "ti-tools",
  //   description: "Furniture & woodwork",
  //   color: "#FAECE7",
  //   iconColor: "#993C1D",
  // },
  // painter: {
  //   icon: "ti-paint",
  //   description: "Walls, trim & touch-ups",
  //   color: "#FBEAF0",
  //   iconColor: "#993556",
  // },
  // add more as your platform grows
};

function MessageRenderer({
  payload,
  sender,
  sendMessage,
}: MessageRendererProps) {
  switch (payload.type) {
    case "text":
      return sender === "ai" ? (
        <div className="w-[375px] px-[14px] py-[12px] mt-2 bg-surface text-text border border-border rounded-[14px_14px_14px_4px]">
          {payload.message}
        </div>
      ) : (
        <div className="px-[14px] py-[10px] bg-purple/80 text-white rounded-[14px_14px_4px_14px]">
          {" "}
          {payload.message}
        </div>
      );

    case "error":
      return <div>{payload.message}</div>;

    // case "unknown":
    //   return <div>{payload.message}</div>;

    case "businessTypes":
    case "greeting":
      return (
        <div className="space-y-2 w-full">
          <div className="w-[373px] px-[14px] py-[12px] bg-surface text-text border border-border rounded-[14px_14px_14px_4px]">
            <span>{payload.message}</span>
          </div>
          <div className="flex gap-x-2  overflow-y-auto scroll-smooth snap-x snap-mandatory scrollbar-hide touch-pan-x">
            {payload?.items?.map((item) => {
              const config = businessTypeConfig[item];
              return (
                <div
                  key={item}
                  className="p-1 border border-border rounded-md shadow-md items-center max-w-[220px] shrink-0 snap-start"
                >
                  {config.image && (
                    <img
                      src={config.image}
                      alt={item}
                      className="w-full h-31 object-cover rounded-md"
                    />
                  )}

                  <div className="py-2 leading-[1.4] border-b border-border font-['Syne',sans-serif]">
                    <span className="text-[14px] font-medium">
                      {config.label} ↩{" "}
                    </span>
                    <p className=" leading-[1.9] text-[12px] font-['Syne',sans-serif] text-text/90 font-extralight font-Syne">
                      {config.description}
                    </p>
                  </div>

                  <div
                    onClick={() => sendMessage(`i want ${item}`)}
                    className="py-2 text-center font-['Syne',sans-serif] font-medium leading-[1.5]"
                  >
                    <button> {config.button} </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    case "categories":
      return (
        <div className="space-y-2 w-full">
          <div className="w-[382px] px-[14px] py-[12px] bg-surface text-text border border-border rounded-[14px_14px_14px_4px]">
            <span className="  ">{payload.message}</span>
          </div>
          <div className="flex gap-x-2">
            {payload?.items?.map((item) => {
              const config = categoryConfig[item];
              return (
                <div
                  key={item}
                  className=" w-[195px] border border-border rounded-md shadow-md items-center"
                >
                  {/* Image */}
                  <img
                    src={config.image}
                    alt={item}
                    className="w-full h-[110px] object-cover rounded-md"
                  />

                  {/* Body */}
                  <div className="px-1 py-2">
                    <div className=" leading-[1.4] font-['Syne',sans-serif]">
                      <span className="text-[14px] font-medium">
                        {config.label}
                      </span>
                      <p className=" leading-[1.9] text-text/90 text-[12px] font-extralight font-Syne">
                        {config.description}
                      </p>
                    </div>

                    {/* CTA */}
                    <div
                      onClick={() => sendMessage(`i want ${item}`)}
                      className="py-2 text-center font-['Syne',sans-serif] font-medium leading-[1.5] w-full px-2.5 rounded-lg bg-text/5 border border-border text-[11px] text-text cursor-pointer hover:bg-text/10 transition-colors"
                    >
                      <button className="text-[13px] ">
                        {" "}
                        Hire Now <span className="text-[15px]"> ➜</span>{" "}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    case "providers":
      return (
        <div className="space-y-2 w-full">
          {/* AI message bubble */}
          <div className="w-[382px] px-[14px] py-[12px] bg-surface text-text border border-border rounded-[14px_14px_14px_4px]">
            <span>{payload.message}</span>
          </div>

          {/* Provider cards */}
          <div className="flex gap-x-2 overflow-x-auto pb-1 scrollbar-hide">
            {payload?.items?.map((provider) => (
              <div
                key={provider.id ?? provider.name}
                className="flex-shrink-0 w-[200px] border border-border rounded-xl overflow-hidden shadow-sm"
              >
                {/* Image */}
                {provider.image ? (
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="w-full h-[100px] object-cover"
                  />
                ) : (
                  /* Fallback avatar with initials */
                  <div className="w-full h-[100px] bg-purple/10 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-purple font-['Syne',sans-serif]">
                      {provider.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Body */}
                <div className="p-2.5 space-y-2">
                  <div className="flex items-center gap-1 bg-[#3574b8] rounded-lg w-14 px-2 font-['Syne',sans-serif]">
                    <Star
                      size={12}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span className="text-[11px] text-text">4.5</span>
                  </div>
                  {/* Name + location */}
                  <div>
                    <p className="text-[14px] font-medium text-text leading-tight font-['Syne',sans-serif]">
                      {provider.name.charAt(0).toUpperCase() +
                        provider.name.slice(1)}
                    </p>
                    {provider.location && (
                      <p className="text-[12px] text-text/90 mt-0.5 flex items-center gap-1 font-['Syne',sans-serif]">
                        <MapPin size={12} className="text-text/90" />
                        {provider.location}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  {provider.description && (
                    <p className="text-[11px] text-text/90 leading-[1.5] font-['Syne',sans-serif]">
                      {provider.description}
                    </p>
                  )}

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between pt-2 border-t border-border font-['Syne',sans-serif]">
                    <span className="text-[14px] font-medium text-text ">
                      Rs. {provider.basePrice}
                    </span>
                    <button
                      onClick={() => sendMessage(`book ${provider.name}`)}
                      className="text-[11px] text-[13px]  font-medium px-5 py-2 rounded-md bg-purple/75 border border-border text-text cursor-pointer hover:bg-purple/80 transition-colors"
                    >
                      Book now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default MessageRenderer;
