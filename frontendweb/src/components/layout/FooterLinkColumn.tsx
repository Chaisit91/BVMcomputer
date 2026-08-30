interface FooterLink {
  id: string;
  label: string;
  href: string;
}

interface FooterLinkColumnProps {
  title: string;
  links: FooterLink[];
}

export function FooterLinkColumn({ title, links }: FooterLinkColumnProps) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.id}>
            <a href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
