import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-[#e5e5e7] py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 text-xs text-[#737373] tracking-wide">
        {/* Left Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 group cursor-pointer select-none">
            <div className="relative w-5 h-5 flex items-center justify-center">
              <div className="absolute top-0 left-0 w-3.5 h-3.5 rounded-full border border-black bg-white" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-black border border-black" />
            </div>
            <span className="font-display font-extrabold text-sm tracking-tight text-black">
              Collab
            </span>
          </div>
          <p className="mt-1 max-w-[280px]">
            Visual canvas for real-time creation and collaborative ideation.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex gap-12 flex-wrap">
          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-black uppercase tracking-wider text-[10px]">
              Platform
            </span>
            <Link href="/" className="hover:text-black transition-colors duration-200">
              Features
            </Link>
            <Link href="/about" className="hover:text-black transition-colors duration-200">
              About
            </Link>
          </div>
          {/* <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-black uppercase tracking-wider text-[10px]">
              Company
            </span>
            <Link href="/about" className="hover:text-black transition-colors duration-200">
              Why Collab
            </Link>
            <span className="opacity-50">Careers</span>
          </div> */}
          {/* <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-black uppercase tracking-wider text-[10px]">
              Legal
            </span>
            <span className="opacity-50">Privacy</span>
            <span className="opacity-50">Terms</span>
          </div> */}
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto mt-10 pt-6 border-t border-[#f5f5f7] flex justify-center text-[10px] text-[#737373] tracking-wider capitalize">
        <span className="text-center">© {new Date().getFullYear()} Collab. All Rights Reserved.</span>
      </div>
    </footer>
  );
};
export default Footer;
