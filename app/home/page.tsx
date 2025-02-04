'use client';
import { useState } from 'react';
import Sections from '@/components/home/Sections';
import { useProjectStore } from '@/store/project';
import { useEffect } from 'react';
import Translation from '@/components/Translation';
type Props = {};

function Home({}: Props) {
  const { resetProjectData } = useProjectStore();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    resetProjectData();
    sessionStorage.getItem('translation') ? setOpen(false) : setOpen(true);
  }, []);

  return (
    <>
      <Sections />
      {/* <Translation
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      /> */}
    </>
  );
}

export default Home;
