"use client";

import { MobileWrapper } from "@/components/layout/MobileWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";

export default function LogPage() {
    return (
        <MobileWrapper className="pb-24">
            <Header />
            <div className="p-6 flex flex-col items-center justify-center h-[70vh] text-center">
                <h2 className="text-2xl font-bold mb-2">나의 기록</h2>
                <p className="text-muted-foreground">
                    다녀온 방청 후기를 남기는 공간이야. <br />
                    멋진 로그 기능을 곧 선보일게! ✨
                </p>
            </div>
            <BottomNav />
        </MobileWrapper>
    );
}
