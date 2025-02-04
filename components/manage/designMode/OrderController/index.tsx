'use client';
import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import useCombinedRefs from '@/hooks/useCombineRefs';
import { useTranslation } from 'react-i18next';

const ItemType = 'ITEM';

interface Item {
  id: string;
  title: string;
  type: string;
  order: number;
}

interface DraggedItem {
  index: number;
}

const DraggableItem: React.FC<{
  item: Item;
  index: number;
  moveItem: (fromIndex: number, toIndex: number) => void;
}> = ({ item, index, moveItem }) => {
  const [isMoving, setIsMoving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag, preview] = useDrag<DraggedItem, void, { isDragging: boolean }>({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => setIsMoving(false),
  });

  useEffect(() => {
    setIsMoving(isDragging);
  }, [isDragging]);
  const [, drop] = useDrop<DraggedItem>({
    accept: ItemType,
    hover: (draggedItem: DraggedItem, monitor: DropTargetMonitor) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const combinedRef = useCombinedRefs(ref, drag as any, drop as any);

  return (
    <DragItem ref={combinedRef} isDragging={isMoving}>
      {isMoving ? ' ' : item.type}
    </DragItem>
  );
};

type Props = {
  data: Item[];
  setData: React.Dispatch<React.SetStateAction<Item[]>>;
};

const OrderController: React.FC<Props> = ({ data, setData }) => {
  const { i18n, t } = useTranslation();
  const [position, setPosition] = useState({ x: 1000, y: 1000 });
  const [items, setItems] = useState<Item[]>([]);

  const moveItem = (fromIndex: number, toIndex: number) => {
    const updatedItems = [...items];
    const [movedItem] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, movedItem);

    updatedItems.forEach((item, index) => {
      item.order = index;
    });

    setData(updatedItems);
  };

  const headerDrag = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    e.preventDefault();
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const move = (moveEvent: MouseEvent) => {
      setPosition({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  useEffect(() => {
    const updatePosition = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setPosition((prevPosition) => ({
        x: Math.min(prevPosition.x, width - 220),
        y: Math.min(prevPosition.y, height - 220),
      }));
    };

    const width = window.innerWidth;
    setPosition({
      x: width - 220,
      y: 180,
    });

    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  useEffect(() => {
    const sortedData = [...data].sort((a, b) => a.order - b.order);
    setItems(sortedData);
  }, [data]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Container position={position}>
        <Header>
          <DraggableHeader onMouseDown={headerDrag}>{t('Order')}</DraggableHeader>
        </Header>
        <ItemList>
          {items.map((item, index) => (
            <DraggableItem key={item.id} item={item} index={index} moveItem={moveItem} />
          ))}
        </ItemList>
      </Container>
    </DndProvider>
  );
};

export default OrderController;

const Container = styled.div<{ position: { x: number; y: number } }>`
  position: fixed;
  left: ${({ position }) => position.x}px;
  top: ${({ position }) => position.y}px;
  width: 200px;
  min-height: 200px;
  max-height: 600px;
  overflow-y: auto;
  background-color: #fff;
  border-radius: 10px;
  z-index: 10;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
  padding: 6px 12px 4px 12px;
  border-radius: 10px 10px 0 0;
  font-weight: bold;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const DraggableHeader = styled.div`
  cursor: grab;
`;

const ItemList = styled.div`
  padding: 10px;
`;

const DragItem = styled.div<{ isDragging?: boolean }>`
  background-color: #f0f0f0;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  cursor: grab;
  height: 40px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  ${({ isDragging }) =>
    isDragging &&
    `
        opacity: 0.5;
        border: 2px dotted #000;
    `}
`;
