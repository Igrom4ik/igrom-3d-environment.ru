import { Mailchimp } from "@/components";
import { Posts } from "@/components/blog/Posts";
import { baseURL, blog, person } from "@/resources";
import { Column, Heading, Meta, Schema } from "@once-ui-system/core";

export async function generateMetadata() {
  const title = blog.title;
  const description = blog.description;

  return Meta.generate({
    title,
    description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(title)}`,
    path: blog.path,
  });
}

export default async function Blog() {
  const title = blog.title;
  const description = blog.description;

  return (
    <Column fillWidth maxWidth="l" paddingTop="24">
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        title={title}
        description={description}
        path={blog.path}
        image={`/api/og/generate?title=${encodeURIComponent(title)}`}
        author={{
          name: person.name,
          url: `${baseURL}/blog`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" align="center">
        {title}
      </Heading>
      
      <Column fillWidth flex={1} gap="40" paddingX="l">
        <Posts columns="3" />
        <Mailchimp marginBottom="l" />
      </Column>
    </Column>
  );
}
