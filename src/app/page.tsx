"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { MobileWrapper } from "@/components/layout/MobileWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const MOCK_PROGRAMS = [
  {
    id: 1,
    title: "뮤직뱅크",
    broadcaster: "KBS2",
    date: "2024.01.05 (금)",
    dDay: "D-3",
    image: "from-blue-500 to-indigo-500",
    tags: ["음악방송", "생방송"],
  },
  {
    id: 2,
    title: "유희열의 스케치북",
    broadcaster: "KBS2",
    date: "2024.01.09 (화)",
    dDay: "D-7",
    image: "from-violet-500 to-purple-500",
    tags: ["토크쇼", "라이브"],
  },
  {
    id: 3,
    title: "코미디빅리그",
    broadcaster: "tvN",
    date: "2024.01.07 (일)",
    dDay: "D-5",
    image: "from-pink-500 to-rose-500",
    tags: ["공개코미디", "방청객"],
  },
  {
    id: 4,
    title: "인기가요",
    broadcaster: "SBS",
    date: "2024.01.14 (일)",
    dDay: "D-12",
    image: "from-cyan-400 to-blue-400",
    tags: ["음악방송", "인기"],
  },
];

const CATEGORIES = ["전체", "음악방송", "토크쇼", "예능", "공개방송"];

export default function Home() {
  return (
    <MobileWrapper className="pb-24">
      <Header />

      {/* Hero Section */}
      <section className="px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold leading-tight">
            나의 첫 번째 <br />
            <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              방청 기록
            </span>
            을 시작해봐!
          </h1>
          <p className="mt-2 text-muted-foreground">
            세상에서 가장 빠른 본방사수, 방청로그
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="mt-6 relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="어떤 방송을 찾고 있니?"
            className="w-full h-12 rounded-2xl bg-secondary/30 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-muted-foreground/50 text-foreground"
          />
        </motion.div>
      </section>

      {/* Categories */}
      <section className="pl-6 overflow-x-auto scrollbar-hide mb-8">
        <div className="flex gap-2 pr-6 w-max">
          {CATEGORIES.map((cat, idx) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${idx === 0
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 border border-white/5"
                }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Program List */}
      <section className="px-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">마감 임박! 🔥</h2>
          <button className="text-xs text-muted-foreground hover:text-primary transition-colors">전체보기</button>
        </div>

        {MOCK_PROGRAMS.map((program, idx) => (
          <Card key={program.id} className="overflow-hidden border-0 bg-secondary/10 hover:bg-secondary/20 transition-colors group cursor-pointer">
            <CardContent className="p-0 flex h-32">
              {/* Image Placeholder with Gradient */}
              <div className={`w-28 h-full bg-gradient-to-br ${program.image} flex flex-col items-center justify-center text-white p-2 relative shrink-0`}>
                <span className="font-bold text-center text-shadow-sm">{program.broadcaster}</span>
                <div className="absolute top-2 left-2">
                  <div className="bg-black/20 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold border border-white/10">
                    {program.dDay}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1.5 mb-2">
                    {program.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-1.5 bg-background/50 text-muted-foreground backdrop-blur-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">{program.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{program.date}</p>
                </div>

                <div className="flex justify-end">
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-3 hover:bg-primary/10 hover:text-primary">
                    자세히 보기 &rarr;
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <BottomNav />
    </MobileWrapper>
  );
}
