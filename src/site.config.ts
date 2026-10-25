// Everything personal about the site lives here, so it can be edited without touching components.

export const SITE = {
  name: 'Suyog Adhikari',
  shortName: 'Suyog',
  role: 'Full-stack engineer',
  tagline: 'Full-stack engineer working on Web3 and applied cryptography',
  description:
    'Suyog Adhikari is a full-stack engineer from Nepal, lately a senior backend engineer at Money Mitra, previously tech lead at Venture23, building web products, backend systems, smart contracts and on-chain infrastructure.',
  location: 'Bhaktapur, Nepal',
  email: 'iamgoyus@gmail.com',
  locale: 'en',
} as const;

export const LINKS = {
  github: 'https://github.com/Suyog007',
  linkedin: 'https://www.linkedin.com/in/suyog-adhikari-5b483718a',
} as const;

// Writing lives on its own subdomain, served from a second Netlify project that
// is built with WRITING_HOME set. The two sites link to each other with absolute URLs.
export const MAIN_URL = 'https://suyogadhikari.tech';
export const WRITING_URL = 'https://writing.suyogadhikari.tech';
export const IS_WRITING_SITE = Boolean(process.env.WRITING_HOME);

const main = (path: string) => (IS_WRITING_SITE ? `${MAIN_URL}${path}` : path);

export const HOME_URL = main('/');

export const NAV = [
  { href: IS_WRITING_SITE ? '/writing' : WRITING_URL, label: 'Writing' },
  { href: main('/projects'), label: 'Projects' },
  { href: main('/about'), label: 'About' },
  { href: main('/resume'), label: 'Resume' },
] as const;

export const RESUMES = [
  {
    id: 'resume',
    title: 'Full-stack, backend & Web3',
    file: '/resume/suyog-adhikari-resume.pdf',
    summary:
      'Backend systems and high-throughput APIs, React and Next.js frontends, blockchain infrastructure, smart contracts and applied cryptography — the last seven years in one PDF.',
    audience: 'Full-stack, backend and Web3 roles.',
  },
] as const;
