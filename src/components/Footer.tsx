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
  { labelKey: 'social.facebook', href: 'https://www.facebook.com/ugandafamilytours', icon: FaFacebookF },
  { labelKey: 'social.youtube', href: 'https://www.youtube.com/@ugandafamilytours/shorts', icon: FaYoutube },
  { labelKey: 'social.whatsapp', href: whatsappHref, icon: FaWhatsapp },
]

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="relative bg-[#1f2937] text-white">
      <div className="container-custom grid grid-cols-2 gap-x-6 gap-y-7 pb-8 pt-8 md:grid-cols-2 md:gap-10 md:py-14 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-sm text-xs leading-5 text-white/65 md:mt-5 md:text-sm md:leading-7">{t('footer.about')}</p>
        </div>
        <div className="col-span-2 md:col-span-1">
          <h3 className="footer-title">{t('footer.contact')}</h3>
          <ul className="mt-3 grid gap-2 text-sm text-white/75 sm:grid-cols-3 md:mt-5 md:block md:space-y-3">
            <li><a className="flex min-w-0 gap-2 transition hover:text-primary md:gap-3" href={phoneHref}><FaPhone className="mt-1 shrink-0 text-primary" /><span className="truncate">{phoneDisplay}</span></a></li>
            <li><a className="flex min-w-0 gap-2 transition hover:text-primary md:gap-3" href={emailHref}><MdEmail className="mt-1 shrink-0 text-primary" /><span className="truncate">safaris@ugandafamilytours.com</span></a></li>
            <li className="flex min-w-0 gap-2 md:gap-3"><FaLocationDot className="mt-1 shrink-0 text-primary" /><span className="truncate">{t('footer.location')}</span></li>
          </ul>
        </div>
        <div>
          <h3 className="footer-title">{t('footer.quickLinks')}</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-white/75 md:mt-5 md:space-y-2">
            {[
              [t('navbar.home'), '/'],
              [t('navbar.tours'), '/tours'],
              [t('navbar.about'), '/about'],
            ].map(([item, href]) => (
              <li key={item}><a className="transition hover:text-primary" href={href}>{item}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="footer-title">{t('footer.accept')}</h3>
          <div className="mt-3 flex items-center gap-3 text-3xl md:mt-5">
            <SiVisa className="text-[#1a4ba3]" />
            <FaCcMastercard className="text-[#eb001b]" />
            <FaPaypal className="text-[#009cde]" />
          </div>
          <h3 className="footer-title mt-5 md:mt-8">{t('footer.social')}</h3>
          <div className="mt-3 flex gap-3 md:mt-4">
            {socials.map(({ labelKey, href, icon: Icon }) => (
              <a key={labelKey} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 transition hover:border-primary hover:text-primary" href={href} target="_blank" rel="noreferrer" aria-label={t(labelKey)}>
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4 md:pb-5 md:pt-5">
        <div className="container-custom flex flex-col gap-2 text-xs text-white/60 md:flex-row md:items-center md:justify-between md:text-sm">
          <p>{t('footer.rights')}</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-primary">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-primary">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
