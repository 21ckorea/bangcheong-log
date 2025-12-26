"use client";

import { MobileWrapper } from "@/components/layout/MobileWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";

export default function ApplyPage() {
    return (
        <MobileWrapper className="pb-24">
            <Header />
            <div className="p-6 flex flex-col items-center justify-center h-[70vh] text-center">
                <h2 className="text-2xl font-bold mb-2">응모 가이드</h2>
                <p className="text-muted-foreground">
                    방송사별 복잡한 방청 신청, <br />
                    쉽게 따라할 수 있는 가이드를 준비중이야! 🚧
                </p>
            </div>
            <BottomNav />
        </MobileWrapper>
    );
}
