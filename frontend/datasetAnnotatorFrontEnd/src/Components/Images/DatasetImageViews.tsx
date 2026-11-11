import { useState } from "react";
import { Button, Carousel, Empty, Pagination, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import styled from "styled-components";
import type { Answer, Image, Question } from "../../api";
import { formatAnswer, getImageUrl } from "../Annotation/Annotation";
import { AppColors } from "../Utils/Styles/Colors";
import { AppSizing } from "../Utils/Styles/AppStyles";

// INTERFACES

interface DatasetImageViewsProps {
  images: Image[];
  questions: Question[];
  answers: Answer[];
  currentPage?: number;
  pageSize?: number;
  totalImages?: number;
  onPageChange?: (page: number) => void;
}

interface ImageCardProps {
  image: Image;
  questions: Question[];
  answers: Answer[];
}

interface DatasetImageCarouselProps {
  images: Image[];
  emptyDescription?: string;
  onRemove?: (image: Image) => void;
  removingImageId?: number;
}

// STYLED COMPONENTS

const CarouselViewport = styled.div`
  max-width: 760px;
  margin: 0 auto;
`;

const CarouselSlide = styled.div`
  position: relative;
  padding: 8px 36px 30px;
`;

const ReferenceImage = styled.img`
  display: block;
  width: 100%;
  height: ${AppSizing.ImagePreviewHeight};
  object-fit: contain;
  background: ${AppColors.COLOR_BLACK};

  @media (max-width: 600px) {
    height: 260px;
  }
`;

const MasonryGrid = styled.div`
  columns: 220px;
  column-gap: 16px;

  @media (max-width: 700px) {
    columns: 160px;
    column-gap: 12px;
  }
`;

const MasonryItem = styled.div`
  break-inside: avoid;
  margin-bottom: 16px;
`;

const FlipCardButton = styled.button`
  display: block;
  position: relative;
  width: 100%;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 6px;
  background: ${AppColors.COLOR_BLACK};
  color: #fff;
  cursor: pointer;
  text-align: left;

  &:focus-visible {
    outline: 3px solid #1677ff;
    outline-offset: 3px;
  }

  &.is-flipped .image-card-inner {
    transform: rotateY(180deg);
  }
`;

const FlipCardInner = styled.span`
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 450ms ease;
`;

const CardFace = styled.span`
  display: block;
  backface-visibility: hidden;
  border-radius: 6px;
  overflow: hidden;
`;

const ImageFace = styled(CardFace)`
  position: relative;
  width: 100%;
`;

const DatasetImageElement = styled.img`
  display: block;
  width: 100%;
  height: auto;
  max-height: 220px;
  object-fit: contain;
`;

const ImageDetails = styled(CardFace)`
  position: absolute;
  inset: 0;
  padding: 18px;
  overflow-y: auto;
  background: ${AppColors.COLOR_BG_VERY_DARK};
  transform: rotateY(180deg);
`;

const FileName = styled.span`
  display: block;
  padding: 10px 12px;
  overflow-wrap: anywhere;
  background: ${AppColors.COLOR_BG_VERY_DARK};
  font-weight: 600;
`;

const AnswerList = styled.dl`
  margin: 14px 0 0;
`;

const AnswerItem = styled.div`
  padding: 10px 0;
  border-top: 1px solid ${AppColors.MASK_SELECTED};
`;

const QuestionText = styled.dt`
  margin-bottom: 4px;
  color: ${AppColors.COLOR_CLEAR_TEXT_FOR_DARK_BG};
  font-size: 0.875rem;
`;

const AnswerText = styled.dd`
  margin: 0;
  overflow-wrap: anywhere;
`;

// Components

const ImageCard = ({
  image,
  questions,
  answers,
}: ImageCardProps) => {
  const [flipped, setFlipped] = useState(false);
  const fileName = image.path.split("/").pop() ?? image.path;
  const imageAnswers = answers.filter((answer) => answer.image === image.id);

  return (
    <FlipCardButton
      type="button"
      className={flipped ? "is-flipped" : undefined}
      aria-pressed={flipped}
      aria-label={
        flipped ? `Show image ${fileName}` : `Show answers for ${fileName}`
      }
      onClick={() => setFlipped((current) => !current)}
    >
      <FlipCardInner className="image-card-inner">
        <ImageFace>
          <DatasetImageElement
            src={getImageUrl(image.path)}
            alt={fileName}
            loading="lazy"
          />
          <FileName>{fileName}</FileName>
        </ImageFace>
        <ImageDetails>
          <strong>{fileName}</strong>
          <AnswerList>
            {questions.map((question) => (
              <AnswerItem key={question.id}>
                <QuestionText>{question.text}</QuestionText>
                <AnswerText>
                  {formatAnswer(
                    imageAnswers.find(
                      (answer) => answer.question === question.id,
                    ),
                  )}
                </AnswerText>
              </AnswerItem>
            ))}
          </AnswerList>
        </ImageDetails>
      </FlipCardInner>
    </FlipCardButton>
  );
};

export const DatasetImageCarousel = ({
  images,
  emptyDescription = "No reference images",
  onRemove,
  removingImageId,
}: DatasetImageCarouselProps) => {
  if (images.length === 0) return <Empty description={emptyDescription} />;

  return (
    <CarouselViewport>
      <Carousel arrows infinite={false}>
        {images.map((image) => (
          <CarouselSlide key={image.id}>
            <ReferenceImage
              src={getImageUrl(image.path)}
              alt={image.path.split("/").pop() ?? image.path}
              loading="lazy"
            />
            {onRemove && (
              <Popconfirm
                title="Remove reference image?"
                description="Questions using this image will no longer reference it."
                okText="Remove"
                okButtonProps={{ danger: true }}
                onConfirm={() => onRemove(image)}
              >
                <Button
                  danger
                  aria-label="Remove reference image"
                  title="Remove reference image"
                  icon={<DeleteOutlined />}
                  loading={removingImageId === image.id}
                  style={{ position: "absolute", top: 16, right: 44 }}
                />
              </Popconfirm>
            )}
          </CarouselSlide>
        ))}
      </Carousel>
    </CarouselViewport>
  );
};

export const DatasetImageMasonry = ({
  images,
  questions,
  answers,
  currentPage = 1,
  pageSize = 24,
  totalImages,
  onPageChange,
}: DatasetImageViewsProps) => {
  const totalCount = Math.max(totalImages ?? images.length, images.length);

  if (images.length === 0) return <Empty description="No dataset images" />;

  return (
    <>
      <MasonryGrid>
        {images.map((image) => (
          <MasonryItem key={image.id}>
            <ImageCard image={image} questions={questions} answers={answers} />
          </MasonryItem>
        ))}
      </MasonryGrid>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={totalCount}
        onChange={onPageChange}
        showSizeChanger={false}
        style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
      />
    </>
  );
};