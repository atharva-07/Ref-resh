export interface ImageGridProps {
  images: string[];
}

const gridClasses = new Map<number, string>();
gridClasses.set(1, "rounded-xl overflow-hidden");
gridClasses.set(
  2,
  "flex gap-1 child:basis-[calc(50%-3px)] child:h-[14rem] rounded-xl overflow-hidden"
);
gridClasses.set(
  3,
  "flex gap-1 flex-wrap child:basis-[calc(50%-3px)] child:h-[12rem] last:child:h-[15rem] last:child:flex-grow rounded-xl overflow-hidden"
);
gridClasses.set(
  4,
  "flex gap-1 flex-wrap child:basis-[calc(50%-3px)] child:h-[12rem] rounded-xl overflow-hidden"
);

const ImageGrid = ({ images }: ImageGridProps) => {
  const activeGridClass = gridClasses.get(images.length);
  return (
    <div className={activeGridClass}>
      {images.map((element) => {
        return (
          <div>
            <img
              src={element}
              className="block w-full h-full object-cover cursor-pointer"
              alt="post-image"
            />
          </div>
        );
      })}
    </div>
  );
};

export default ImageGrid;
