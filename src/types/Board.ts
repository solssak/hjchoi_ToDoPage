export type BoardProps = {
  id: string;
  title: string;
  desc: string;
  items: Array<{
    id: string;
    title: string;
  }>;
};
