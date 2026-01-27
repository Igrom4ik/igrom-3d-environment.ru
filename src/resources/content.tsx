import type { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { Line, Row, Text } from "@once-ui-system/core";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const person: Person = {
  firstName: "Igor",
  lastName: "Unguryanov",
  name: "Igor Unguryanov",
  role: "Senior Environment Artist",
  avatar: `${basePath}/images/avatar.jpg`,
  email: "igrom4ikus@gmail.com",
  location: "Europe/Kaliningrad", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: ["English", "Русский"], // optional: Leave the array empty if you don't want to display languages
};

const newsletter: Newsletter = {
  display: true,
  title: `Subscribe to ${person.firstName}'s Newsletter`,
  description: "My weekly newsletter about creativity and engineering",
};

const social: Social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  // Set essentials: true for links you want to show on the about page
  {
    name: "ArtStation",
    icon: "artstation",
    link: "https://www.artstation.com/igrom",
    essential: true,
  },
  {
    name: "Telegram",
    icon: "telegram",
    link: "https://t.me/igrom",
    essential: true,
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
    essential: true,
  },
  {
    name: "Phone",
    icon: "phone",
    link: "tel:+79316067781",
    essential: true,
  },
];

const home: Home = {
  path: "/",
  image: `${basePath}/images/og/home.jpg`,
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: "Creating immersive 3D environments for games",
  featured: {
    display: false,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">Featured Project</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Featured work
        </Text>
      </Row>
    ),
    href: "/work",
  },
  subline: (
    <>
      I'm Igor, a Lead Environment Artist at{" "}
      <Text as="span" size="xl" weight="strong">
        EveGoPlayOn
      </Text>
      , specializing in <br /> procedural generation with Houdini and creating realistic game
      environments.
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: true,
    link: "https://cal.com",
  },
  intro: {
    display: true,
    title: "Introduction",
    description:
      "Selene is a Jakarta-based design engineer with a passion for transforming complex challenges into simple, elegant design solutions. Her work spans digital interfaces, interactive experiences, and the convergence of design and technology.",
  },
  work: {
    display: true,
    title: "Work Experience",
    experiences: [
      {
        company: "FLY",
        timeframe: "2022 - Present",
        role: "Senior Design Engineer",
        achievements: [
          "Redesigned the UI/UX for the FLY platform, resulting in a 10% increase in user engagement and 30% faster load times.",
          "Spearheaded the integration of AI tools into design workflows, enabling designers to iterate 50% faster.",
        ],
        images: [
          // optional: leave the array empty if you don't want to display images
          {
            src: `${basePath}/images/projects/project-01/cover-01.jpg`,
            alt: "Once UI Project",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        company: "Creativ3",
        timeframe: "2018 - 2022",
        role: "Lead Designer",
        achievements: [
          "Developed a design system that unified the brand across multiple platforms, improving design consistency by 40%.",
          "Led a cross-functional team to launch a new product line, contributing to a 15% increase in overall company revenue.",
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: true,
    title: "Studies",
    institutions: [
      {
        name: "University of Jakarta",
        description: <>Studied software engineering.</>,
      },
      {
        name: "Build the Future",
        description: <>Studied online marketing and personal branding.</>,
      },
    ],
  },
  technical: {
    display: true,
    title: "Technical skills",
    skills: [
      {
        title: "Figma",
        description: <>Able to prototype in Figma with Once UI with unnatural speed.</>,
        images: [
          {
            src: `${basePath}/images/projects/project-01/cover-02.jpg`,
            alt: "Project 01",
            width: 16,
            height: 9,
          },
          {
            src: `${basePath}/images/projects/project-01/cover-03.jpg`,
            alt: "Project 01",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        title: "Next.js",
        description: "Building next gen apps with Next.js + Once UI + Supabase.",
        images: [
          {
            src: `${basePath}/images/projects/project-01/cover-04.jpg`,
            alt: "Project 01",
            width: 16,
            height: 9,
          },
        ],
      },
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "Writing about design and tech...",
  description: `Read what ${person.name} has been up to recently`,
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: "My projects",
  description: `Design and dev projects by ${person.name}`,
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: "My photo gallery",
  description: `A photo collection by ${person.name}`,
  images: [
    {
      src: `${basePath}/marmoset/MikitarHat.mview`,
      alt: "Mikitar Hat 3D Model",
      orientation: "horizontal",
    },
    {
      src: `${basePath}/images/gallery/vertical-1.jpg`,
      alt: "image",
      orientation: "vertical",
    },
    {
      src: `${basePath}/images/gallery/horizontal-1.jpg`,
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: `${basePath}/images/gallery/vertical-2.jpg`,
      alt: "image",
      orientation: "vertical",
    },
    {
      src: `${basePath}/images/gallery/horizontal-2.jpg`,
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: `${basePath}/images/gallery/horizontal-3.jpg`,
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: `${basePath}/images/gallery/vertical-3.jpg`,
      alt: "image",
      orientation: "vertical",
    },
    {
      src: `${basePath}/images/gallery/horizontal-4.jpg`,
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: `${basePath}/images/gallery/vertical-4.jpg`,
      alt: "image",
      orientation: "vertical",
    },
    {
      src: `${basePath}/images/gallery/horizontal-1.jpg`,
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: `${basePath}/images/gallery/horizontal-2.jpg`,
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: `${basePath}/images/gallery/vertical-1.jpg`,
      alt: "image",
      orientation: "vertical",
    },
    {
      src: `${basePath}/images/gallery/horizontal-3.jpg`,
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: `${basePath}/images/gallery/horizontal-4.jpg`,
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: `${basePath}/images/gallery/horizontal-1.jpg`,
      alt: "image",
      orientation: "horizontal",
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };
