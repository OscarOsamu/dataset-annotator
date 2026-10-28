import { useState } from "react";
import { Carousel, Empty, Pagination } from "antd";
import styled from "styled-components";
import type { Answer, Image, Question } from "../../api";
import { apiConfig } from "../../configuration";

interface DatasetImageViewsProps {
  images: Image[];
  questions: Question[];
  answers: Answer[];
}

interface ImageCardProps {
  image: Image;
  questions: Question[];
  answers: Answer[];
}

interface DatasetImageCarouselProps {
  images: Image[];
}

const CarouselViewport = styled.div`
  max-width: 760px;
  margin: 0 auto;
`;

const CarouselSlide = styled.div`
  padding: 8px 36px 30px;
`;

const ReferenceImage = styled.img`
  display: block;
  width: 100%;
  height: 360px;
  object-fit: contain;
  background: #101820;

  @media (max-width: 600px) {
    height: 260px;
  }
`;

const MasonryGrid = styled.div`
  columns: 3 220px;
  column-gap: 16px;

  @media (max-width: 700px) {
    columns: 2 160px;
    column-gap: 12px;
  }
`;

const MasonryPagination = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

const MasonryItem = styled.div`
  break-inside: avoid;
  margin-bottom: 16px;
`;

const FlipCardButton = styled.button`
  display: block;
  position: relative;
  width: 100%;
  min-height: 180px;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 6px;
  background: #101820;
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
  object-fit: cover;
`;

const ImageDetails = styled(CardFace)`
  position: absolute;
  inset: 0;
  padding: 18px;
  overflow-y: auto;
  background: #17232c;
  transform: rotateY(180deg);
`;

const FileName = styled.span`
  display: block;
  padding: 10px 12px;
  overflow-wrap: anywhere;
  background: #17232c;
  font-weight: 600;
`;

const AnswerList = styled.dl`
  margin: 14px 0 0;
`;

const AnswerItem = styled.div`
  padding: 10px 0;
  border-top: 1px solid #ffffff2e;
`;

const QuestionText = styled.dt`
  margin-bottom: 4px;
  color: #c6d0d8;
  font-size: 0.875rem;
`;

const AnswerText = styled.dd`
  margin: 0;
  overflow-wrap: anywhere;
`;

const getImageUrl = (path: string) => {
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${apiConfig.basePath}/data/${encodedPath}`;
};

const formatAnswer = (answer: Answer | undefined) => {
  if (!answer) return "Not answered";
  if (answer.is_unclear) return "Unclear";
  if (answer.answer_integer !== undefined && answer.answer_integer !== null) {
    return String(answer.answer_integer);
  }
  if (Array.isArray(answer.answer_choices)) {
    return answer.answer_choices.map(String).join(", ");
  }
  return "Not answered";
};

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
}: DatasetImageCarouselProps) => {
  if (images.length === 0) return <Empty description="No reference images" />;

  return (
    <CarouselViewport>
      <Carousel arrows>
        {images.map((image) => (
          <CarouselSlide key={image.id}>
            <ReferenceImage
              src={getImageUrl(image.path)}
              alt={image.path.split("/").pop() ?? image.path}
              loading="lazy"
            />
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
}: DatasetImageViewsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;
  const pageImages = images.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (images.length === 0) return <Empty description="No dataset images" />;

  return (
    <>
      <MasonryGrid>
        {pageImages.map((image) => (
          <MasonryItem key={image.id}>
            <ImageCard image={image} questions={questions} answers={answers} />
          </MasonryItem>
        ))}
      </MasonryGrid>
      <MasonryPagination>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={images.length}
          onChange={setCurrentPage}
          showSizeChanger={false}
        />
      </MasonryPagination>
    </>
  );
};