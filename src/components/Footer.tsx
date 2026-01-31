import { person, social } from "@/resources";
import { IconButton, Row, SmartLink, Text, Column } from "@once-ui-system/core";
import styles from "./Footer.module.scss";
import ContactForm from "./ContactForm";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Row as="footer" fillWidth padding="8" horizontal="center" s={{ direction: "column" }}>
      <Column
        fillWidth
        maxWidth="m"
        paddingY="40"
        paddingX="16"
        gap="32"
        horizontal="center"
      >
        <ContactForm />
        
        <Row
          className={styles.mobile}
          fillWidth
          gap="16"
          horizontal="between"
          vertical="center"
          s={{
            direction: "column",
            horizontal: "center",
            align: "center",
          }}
        >
          <Text variant="body-default-s" onBackground="neutral-strong">
            <Text onBackground="neutral-weak">© {currentYear} /</Text>
            <Text paddingX="4">{person.name}</Text>
            <Text onBackground="neutral-weak">
              {/* Usage of this template requires attribution. Please don't remove the link to Once UI unless you have a Pro license. */}
              / Build your portfolio with{" "}
              <SmartLink href="https://once-ui.com/products/magic-portfolio">Once UI</SmartLink>
            </Text>
          </Text>
          <Row gap="16">
            {social.map(
              (item) =>
                item.link && (
                  <IconButton
                    key={item.name}
                    href={item.link}
                    icon={item.icon}
                    tooltip={item.name}
                    size="s"
                    variant="ghost"
                  />
                ),
            )}
          </Row>
        </Row>
      </Column>
      <Row height="80" hide s={{ hide: false }} />
    </Row>
  );
};
