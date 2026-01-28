"use client";

import { Column, Heading, SmartLink, Grid } from "@once-ui-system/core";

export default function PreviewIndexPage() {
  return (
    <Column fillWidth padding="l" gap="l" horizontal="center" align="center">
      <Heading variant="display-strong-s">Preview Mode</Heading>
      <Grid columns="3" gap="m">
        <SmartLink href="/preview/home">Home Page</SmartLink>
        <SmartLink href="/preview/work">Work Page</SmartLink>
        <SmartLink href="/preview/blog">Blog Page</SmartLink>
        <SmartLink href="/preview/about">About Page</SmartLink>
        <SmartLink href="/preview/gallery">Gallery Page</SmartLink>
      </Grid>
    </Column>
  );
}
