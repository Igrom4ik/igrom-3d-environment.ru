import type { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { Line, Row, Text } from "@once-ui-system/core";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const person: Person = {
  firstName: "Igor",
  lastName: "Unguryanov",
  name: "Игорь Унгурьянов",
  role: "Senior Environment Artist",
  avatar: `${basePath}/images/avatar.jpg`,
  email: "igrom4ikus@gmail.com",
  location: "Калининград, Россия",
  timeZone: "Europe/Kaliningrad",
  languages: ["Русский", "English"], // optional: Leave the array empty if you don't want to display languages
};

const newsletter: Newsletter = {
  display: true,
  title: `Подпишитесь на рассылку ${person.firstName}`,
  description: "Моя еженедельная рассылка о 3D и разработке игр",
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
  label: "Главная",
  title: `Портфолио ${person.name}`,
  description: `Сайт-портфолио ${person.role}`,
  headline: "Создаю захватывающие 3D-окружения для игр",
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
      Я Игорь, Lead Environment Artist в{" "}
      <Text as="span" size="xl" weight="strong">
        EveGoPlayOn
      </Text>
      , специализируюсь на <br /> процедурной генерации с Houdini и создании реалистичных игровых
      окружений.
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "Обо мне",
  title: `Обо мне – ${person.name}`,
  description: `Познакомьтесь с ${person.name}, ${person.role} из ${person.location}`,
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
    title: "Обо мне",
    description:
      "Игорь Унгурьянов — Senior Environment Artist из Калининграда, Россия, с опытом работы в игровой индустрии более 6 лет. Специализируется на создании высококачественных окружений для игр, совмещая ручное моделирование с техниками процедурной генерации в Houdini.",
  },
  work: {
    display: true,
    title: "Опыт работы",
    experiences: [
      {
        company: "EveGoPlayOn",
        timeframe: "Дек 2023 - Наст. время",
        role: "Lead Environment Artist",
        achievements: [
          "Создание локаций для игровых проектов и процедурная генерация с использованием Houdini.",
          "Ручное создание ассетов (Blender 3D) и текстурирование в рамках различных пайплайнов.",
          "Координация команды аутсорса из 10 специалистов (Environment / Props / Level Design).",
          "Планирование, приоритизация и контроль качества арт-ассетов.",
        ],
        images: [],
      },
      {
        company: "Jet Games",
        timeframe: "Окт 2020 - Наст. время",
        role: "3D Modeler / Level Designer",
        achievements: [
          "Грейбоксинг локаций и моделирование объектов окружения (экстерьер/интерьер).",
          "Создание пропсов, UV-развертка, LODs и текстурирование.",
          "Оптимизация и настройка объектов в игровом движке.",
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: true,
    title: "Образование",
    institutions: [
      {
        name: "Сыктывкарский медицинский колледж",
        description: <>Лечебное дело (2010)</>,
      },
    ],
  },
  technical: {
    display: true,
    title: "Навыки",
    skills: [
      {
        title: "3D Modeling & Texturing",
        description: <>Blender 3D, Rizom UV, Substance Painter, Substance Designer, Marmoset Toolbag, Adobe Photoshop.</>,
        images: [],
      },
      {
        title: "Game Engines",
        description: "Unreal Engine 5, Unity.",
        images: [],
      },
      {
        title: "Procedural",
        description: "Houdini (Procedural Modeling, HDA).",
        images: [],
      },
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Блог",
  title: "Блог о дизайне и технологиях...",
  description: `Читайте последние новости от ${person.name}`,
};

const work: Work = {
  path: "/work",
  label: "Работы",
  title: "Мои проекты",
  description: `Проекты ${person.name}`,
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Галерея",
  title: "Галерея",
  description: `Галерея работ ${person.name}`,
  images: [],
};

export { about, blog, gallery, home, newsletter, person, social, work };
