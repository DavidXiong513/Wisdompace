'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function DonateButton() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#C87941]/50 bg-[#C87941]/10 px-3.5 py-1 text-xs font-medium text-[#C87941] transition-all hover:border-[#C87941] hover:bg-[#C87941]/15"
      >
        🥤 请思考熊喝杯豆浆
      </button>

      {show && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShow(false)}
        >
          <div
            className="relative mx-4 w-full max-w-xs transform rounded-2xl bg-white p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShow(false)}
              className="absolute -right-2.5 -top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs text-[#8A7E6A] shadow-md transition-all hover:bg-[#F5F0E8] hover:text-[#4A3728]"
            >
              ✕
            </button>

            <div className="mb-4 text-center">
              <div className="text-2xl">🥤</div>
              <h3 className="mt-2 text-base font-bold text-[#4A3728]">
                请思考熊喝杯豆浆
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#8A7E6A]">
                您的支持是思考熊持续创作的动力～
              </p>
            </div>

            <div className="mx-auto mb-4 h-px w-12 bg-gradient-to-r from-transparent via-[#C87941] to-transparent" />

            <div className="flex justify-center">
              <div className="overflow-hidden rounded-xl border border-[#E8D9C2] bg-[#FDF5EE] p-3 shadow-inner">
                <Image
                  src="/images/donate-qr.png"
                  alt="赞赏码"
                  width={200}
                  height={200}
                  className="h-auto w-full max-w-[200px]"
                  priority
                />
              </div>
            </div>

            <p className="mt-4 text-center text-[10px] text-[#B8A888]">
              微信扫一扫 · 随缘支持
            </p>
          </div>
        </div>
      )}
    </>
  );
}
