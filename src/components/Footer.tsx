import { FaCcMastercard, FaFacebookF, FaLocationDot, FaPaypal, FaPhone, FaWhatsapp, FaYoutube } from 'react-icons/fa6'
import { MdEmail } from 'react-icons/md'
import { SiVisa } from 'react-icons/si'
import { Logo } from './Logo'

const phoneDisplay = '+256 703 543027'
const phoneHref = 'tel:+256703543027'
const whatsappHref = 'https://wa.me/256703543027'
const emailHref = 'mailto:safaris@ugandafamilytours.com'
const socials = [
  { label: 'Facebook', href: 'https://www.facebook.com/ugandafamilytours', icon: FaFacebookF },
  { label: 'YouTube', href: 'https://www.youtube.com/@ugandafamilytours/shorts', icon: FaYoutube },
  { label: 'WhatsApp', href: whatsappHref, icon: FaWhatsapp },
]

export function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="container-custom grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
            We are a local family-owned travel company specializing in tailor-made eco-safari experiences in Uganda and East Africa.
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <a key={label} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-white transition hover:border-primary hover:bg-primary" href={href} target="_blank" rel="noreferrer" aria-label={label}>
                <Icon />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="footer-title">Contact Us</h3>
          <ul className="mt-5 space-y-3 text-sm text-white/75">
            <li><a className="flex gap-3 transition hover:text-primary" href={phoneHref}><FaPhone className="mt-1 text-primary" />{phoneDisplay}</a></li>
            <li><a className="flex gap-3 transition hover:text-primary" href={emailHref}><MdEmail className="mt-1 text-primary" />safaris@ugandafamilytours.com</a></li>
            <li className="flex gap-3"><FaLocationDot className="mt-1 text-primary" />Kampala, Uganda</li>
          </ul>
        </div>
        <div>
          <h3 className="footer-title">Quick Links</h3>
          <ul className="mt-5 space-y-2 text-sm text-white/75">
            {[
              ['Home', '/'],
              ['Tours', '/tours'],
              ['About Us', '/about'],
            ].map(([item, href]) => (
              <li key={item}><a className="transition hover:text-primary" href={href}>{item}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="footer-title">We Accept</h3>
          <div className="mt-5 flex items-center gap-3 text-3xl">
            <SiVisa className="text-[#1a4ba3]" />
            <FaCcMastercard className="text-[#eb001b]" />
            <FaPaypal className="text-[#009cde]" />
          </div>
          <h3 className="footer-title mt-8">Connect With Us</h3>
          <div className="mt-4 flex gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <a key={label} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 transition hover:border-primary hover:text-primary" href={href} target="_blank" rel="noreferrer" aria-label={label}>
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container-custom flex flex-col gap-3 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© 2025 Uganda Family Tours & Safari Co. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
