import { FaCcMastercard, FaFacebookF, FaLocationDot, FaPaypal, FaPhone, FaWhatsapp, FaYoutube } from 'react-icons/fa6'
import { MdEmail } from 'react-icons/md'
import { SiVisa } from 'react-icons/si'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  return (
    <footer className="relative bg-[#1f2937] text-white">
      <div className="container-custom grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">{t('footer.about')}</p>
          <div className="mt-5 flex gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <a key={label} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-white transition hover:border-[#FD5E02] hover:bg-white/10 hover:text-[#FD5E02]" href={href} target="_blank" rel="noreferrer" aria-label={label}>
                <Icon />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="footer-title">{t('footer.contact')}</h3>
          <ul className="mt-5 space-y-3 text-sm text-white/75">
            <li><a className="flex gap-3 transition hover:text-[#FD5E02]" href={phoneHref}><FaPhone className="mt-1 text-[#FD5E02]" />{phoneDisplay}</a></li>
            <li><a className="flex gap-3 transition hover:text-[#FD5E02]" href={emailHref}><MdEmail className="mt-1 text-[#FD5E02]" />safaris@ugandafamilytours.com</a></li>
            <li className="flex gap-3"><FaLocationDot className="mt-1 text-[#FD5E02]" />{t('footer.location')}</li>
          </ul>
        </div>
        <div>
          <h3 className="footer-title">{t('footer.quickLinks')}</h3>
          <ul className="mt-5 space-y-2 text-sm text-white/75">
            {[
              [t('navbar.home'), '/'],
              [t('navbar.tours'), '/tours'],
              [t('navbar.about'), '/about'],
            ].map(([item, href]) => (
              <li key={item}><a className="transition hover:text-[#FD5E02]" href={href}>{item}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="footer-title">{t('footer.accept')}</h3>
          <div className="mt-5 flex items-center gap-3 text-3xl">
            <SiVisa className="text-[#1a4ba3]" />
            <FaCcMastercard className="text-[#eb001b]" />
            <FaPaypal className="text-[#009cde]" />
          </div>
          <h3 className="footer-title mt-8">{t('footer.social')}</h3>
          <div className="mt-4 flex gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <a key={label} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 transition hover:border-[#FD5E02] hover:text-[#FD5E02]" href={href} target="_blank" rel="noreferrer" aria-label={label}>
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container-custom flex flex-col gap-3 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>{t('footer.rights')}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#FD5E02]">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-[#FD5E02]">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
