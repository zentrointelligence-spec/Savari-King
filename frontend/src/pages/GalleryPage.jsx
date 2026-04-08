import React from "react";
import { useTranslation } from "react-i18next";
import PageWithTitle from "../components/common/PageWithTitle";
import Gallery from "../components/gallery/Gallery";

const GalleryPage = () => {
  const { t } = useTranslation();

  return (
    <PageWithTitle title={`${t("navigation.gallery")} - Ebenezer Tours`}>
      <Gallery />
    </PageWithTitle>
  );
};

export default GalleryPage;
