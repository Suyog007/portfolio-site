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

export const NAV = [
  { href: '/writing', label: 'Writing' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/resume', label: 'Resume' },
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
