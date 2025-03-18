import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import { FaBars, FaTimes } from 'react-icons/fa';

const inter = Inter({ subsets: ['latin'] });

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-800 p-4 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" legacyBehavior>
          <a>
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
          </a>
        </Link>
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="bg-gray-800 w-full">
          <Link href="/" legacyBehavior>
            <a className="block bg-black text-white py-2 px-4 rounded border border-white hover:bg-gray-700 transition duration-300">Home</a>
          </Link>
          <Link href="/eventsCalendar" legacyBehavior>
            <a className="block bg-black text-white py-2 px-4 rounded border border-white hover:bg-gray-700 transition duration-300">Events Calendar</a>
          </Link>
        </div>
      )}
    </nav>
  );
}
