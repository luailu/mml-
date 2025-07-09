import WakaTimeStats from './WakaTimeStats';

export default function Footer() {
  return (
    <footer className="bg-transparent text-slate-500 p-4 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-2 md:mb-0">
          <p>
            <WakaTimeStats />
          </p>
        </div>
        <div className="text-center md:text-right">
          <p>&copy; {new Date().getFullYear()} 葬送的芙莉莲 - 课程期末作业</p>
          <p className="text-xs mt-1">本网站仅用于学习目的，内容版权归原作者所有</p>
        </div>
      </div>
    </footer>
  );
} 