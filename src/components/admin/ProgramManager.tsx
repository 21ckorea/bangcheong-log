"use client";

import { useState, useEffect } from "react";
import { getAdminPrograms, updateProgram, deleteProgram, toggleProgramLock } from "@/app/actions/admin-program";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Search, Loader2, Edit2, Trash2, Lock, Unlock, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";

interface Program {
    id: string;
    title: string;
    broadcaster: string;
    recordDate: Date;
    applyStartDate: Date;
    applyEndDate: Date;
    link: string | null;
    isManual?: boolean;
    tips?: string | null;
}

export default function ProgramManager() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState("");
    const [totalPages, setTotalPages] = useState(1);

    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Fetch data
    const fetchPrograms = async () => {
        setLoading(true);
        const res = await getAdminPrograms(page, query);
        if (res.success && res.data) {
            setPrograms(res.data);
            setTotalPages(res.pagination?.totalPages || 1);
        }
        setLoading(false);
    };

    useEffect(() => {
        const debounce = setTimeout(fetchPrograms, 300);
        return () => clearTimeout(debounce);
    }, [page, query]);

    const handleLockToggle = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        // Optimistic update
        setPrograms(programs.map(p => p.id === id ? { ...p, isManual: newStatus } : p));

        const res = await toggleProgramLock(id, newStatus);
        if (!res.success) {
            toast.error("변경 실패");
            fetchPrograms(); // Revert
        } else {
            toast.success(newStatus ? "크롤러 업데이트 잠금 설정됨" : "잠금 해제됨 (크롤러가 업데이트함)");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const res = await deleteProgram(deleteId);
        if (res.success) {
            toast.success("프로그램이 삭제되었습니다");
            setDeleteId(null);
            fetchPrograms();
        } else {
            toast.error("삭제 실패");
        }
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProgram) return;

        // Extract dates and convert to proper format if needed, but input type='date' gives string YYYY-MM-DD
        // We will pass the state directly, assuming inputs update it correctly. 
        // Note: editingProgram keys need to match what input gives.
        // Actually we need to be careful with Date objects vs string inputs.

        const res = await updateProgram(editingProgram.id, {
            title: editingProgram.title,
            broadcaster: editingProgram.broadcaster,
            link: editingProgram.link,
            // Dates might need conversion from string back to Date object if using server action with specific types
            // But prisma usually handles ISO strings.
            recordDate: new Date(editingProgram.recordDate),
            applyStartDate: new Date(editingProgram.applyStartDate),
            applyEndDate: new Date(editingProgram.applyEndDate),
            tips: editingProgram.tips
        });

        if (res.success) {
            toast.success("수정 완료 (자동으로 잠금 설정됨)");
            setEditingProgram(null);
            fetchPrograms();
        } else {
            toast.error("수정 실패");
        }
    };

    const formatDateForInput = (date: Date | string) => {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatTimeForInput = (date: Date | string) => {
        if (!date) return "";
        const d = new Date(date);
        const h = d.getHours();
        const m = d.getMinutes();
        if (h === 0 && m === 0) return ""; // Treat 00:00 as "No Time"
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="프로그램 제목 또는 방송사 검색..."
                    className="w-full pl-9 pr-4 py-2 bg-secondary/10 rounded-lg border-0 focus:ring-2 focus:ring-violet-500 outline-none"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-violet-500" /></div>
            ) : (
                <div className="space-y-3">
                    {programs.map((program) => (
                        <Card key={program.id} className={`border-0 ${program.isManual ? 'bg-orange-500/5 dark:bg-orange-500/10' : 'bg-secondary/10'}`}>
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20">
                                            {program.broadcaster}
                                        </span>
                                        {program.isManual && (
                                            <span className="text-[10px] flex items-center gap-1 text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800">
                                                <Lock className="w-3 h-3" /> 수동 관리중
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold truncate">{program.title}</h3>
                                    <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                                        <span>
                                            녹화: {new Date(program.recordDate).toLocaleDateString()}
                                            {formatTimeForInput(program.recordDate) && ` ${formatTimeForInput(program.recordDate)}`}
                                        </span>
                                        <span>
                                            마감: {new Date(program.applyEndDate).toLocaleDateString()}
                                            {formatTimeForInput(program.applyEndDate) && ` ${formatTimeForInput(program.applyEndDate)}`}
                                        </span>
                                    </div>
                                    {program.link ? (
                                        <a href={program.link} target="_blank" className="text-xs text-blue-500 flex items-center gap-0.5 mt-1 hover:underline truncate">
                                            <ExternalLink className="w-3 h-3" /> {program.link}
                                        </a>
                                    ) : (
                                        <span className="text-xs text-muted-foreground mt-1 block">링크 없음</span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingProgram(program)}>
                                            <Edit2 className="w-4 h-4 text-green-500" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setDeleteId(program.id)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 text-[10px] px-2"
                                        onClick={() => handleLockToggle(program.id, program.isManual || false)}
                                    >
                                        {program.isManual ? <span className="flex items-center gap-1 text-orange-500"><Unlock className="w-3 h-3" /> 잠금해제</span> : <span className="flex items-center gap-1 text-gray-500"><Lock className="w-3 h-3" /> 잠금설정</span>}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {programs.length === 0 && <p className="text-center text-muted-foreground py-8">결과가 없습니다.</p>}
                </div>
            )}

            {/* Pagination helper usually needed, but simplest is just Prev/Next buttons for now */}
            <div className="flex justify-center gap-2 pt-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>이전</Button>
                <span className="flex items-center text-sm text-muted-foreground">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>다음</Button>
            </div>

            {/* Edit Dialog */}
            <Dialog isOpen={!!editingProgram} onClose={() => setEditingProgram(null)} title="프로그램 수정">
                {editingProgram && (
                    <form onSubmit={handleEditSave} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                        <div>
                            <label className="text-xs font-semibold mb-1 block">제목</label>
                            <input
                                className="w-full p-2 rounded border bg-background"
                                value={editingProgram.title}
                                onChange={e => setEditingProgram({ ...editingProgram, title: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold mb-1 block">방송사</label>
                                <input
                                    className="w-full p-2 rounded border bg-background"
                                    value={editingProgram.broadcaster}
                                    onChange={e => setEditingProgram({ ...editingProgram, broadcaster: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold mb-1 block">신청 링크</label>
                                <input
                                    className="w-full p-2 rounded border bg-background"
                                    value={editingProgram.link || ""}
                                    onChange={e => setEditingProgram({ ...editingProgram, link: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold mb-1 block">녹화일</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="date"
                                        className="flex-1 p-2 rounded border bg-background dark:[color-scheme:dark]"
                                        value={formatDateForInput(editingProgram.recordDate)}
                                        onChange={e => {
                                            const newDate = new Date(editingProgram.recordDate);
                                            const [y, m, d] = e.target.value.split('-').map(Number);
                                            newDate.setFullYear(y, m - 1, d);
                                            setEditingProgram({ ...editingProgram, recordDate: newDate });
                                        }}
                                    />
                                    <div className="relative">
                                        <input
                                            type="time"
                                            className="w-36 p-2 rounded border bg-background dark:[color-scheme:dark]"
                                            value={formatTimeForInput(editingProgram.recordDate)}
                                            onChange={e => {
                                                const newDate = new Date(editingProgram.recordDate);
                                                if (e.target.value) {
                                                    const [h, m] = e.target.value.split(':').map(Number);
                                                    newDate.setHours(h, m);
                                                } else {
                                                    newDate.setHours(0, 0); // Reset to "None"
                                                }
                                                setEditingProgram({ ...editingProgram, recordDate: newDate });
                                            }}
                                        />
                                        {formatTimeForInput(editingProgram.recordDate) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newDate = new Date(editingProgram.recordDate);
                                                    newDate.setHours(0, 0);
                                                    setEditingProgram({ ...editingProgram, recordDate: newDate });
                                                }}
                                                className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold mb-1 block">마감일</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="date"
                                        className="flex-1 p-2 rounded border bg-background dark:[color-scheme:dark]"
                                        value={formatDateForInput(editingProgram.applyEndDate)}
                                        onChange={e => {
                                            const newDate = new Date(editingProgram.applyEndDate);
                                            const [y, m, d] = e.target.value.split('-').map(Number);
                                            newDate.setFullYear(y, m - 1, d);
                                            setEditingProgram({ ...editingProgram, applyEndDate: newDate });
                                        }}
                                    />
                                    <div className="relative">
                                        <input
                                            type="time"
                                            className="w-36 p-2 rounded border bg-background dark:[color-scheme:dark]"
                                            value={formatTimeForInput(editingProgram.applyEndDate)}
                                            onChange={e => {
                                                const newDate = new Date(editingProgram.applyEndDate);
                                                if (e.target.value) {
                                                    const [h, m] = e.target.value.split(':').map(Number);
                                                    newDate.setHours(h, m);
                                                } else {
                                                    newDate.setHours(0, 0); // Reset to "None"
                                                }
                                                setEditingProgram({ ...editingProgram, applyEndDate: newDate });
                                            }}
                                        />
                                        {formatTimeForInput(editingProgram.applyEndDate) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newDate = new Date(editingProgram.applyEndDate);
                                                    newDate.setHours(0, 0);
                                                    setEditingProgram({ ...editingProgram, applyEndDate: newDate });
                                                }}
                                                className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold mb-1 block">방청 꿀팁 (선택)</label>
                            <textarea
                                className="w-full h-24 p-2 rounded border bg-background resize-none"
                                placeholder="예: 30분 전 도착 필수, 검은 옷 착용 등..."
                                value={editingProgram.tips || ""}
                                onChange={e => setEditingProgram({ ...editingProgram, tips: e.target.value })}
                            />
                        </div>
                        <div className="bg-orange-500/10 p-3 rounded text-orange-600 text-xs">
                            <p className="font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> 수정 시 자동 잠금</p>
                            <p>수정 후에는 크롤러가 이 정보를 덮어쓰지 않습니다.</p>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setEditingProgram(null)}>취소</Button>
                            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">저장</Button>
                        </div>
                    </form>
                )}
            </Dialog>

            {/* Delete Dialog */}
            <Dialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="프로그램 삭제">
                <div className="space-y-4">
                    <p className="text-sm">정말로 이 프로그램을 삭제하시겠습니까? <br />삭제하면 복구할 수 없습니다.</p>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setDeleteId(null)}>취소</Button>
                        <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete}>삭제</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
