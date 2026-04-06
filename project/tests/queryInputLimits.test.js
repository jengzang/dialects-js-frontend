import { describe, expect, it } from 'vitest';

import { limitEffectiveChars } from '../src/main/utils/queryInputLimits.js';

describe('limitEffectiveChars', () => {
  it('keeps input unchanged when effective characters are within the limit', () => {
    expect(limitEffectiveChars('漢字 測試', 10)).toEqual({
      value: '漢字 測試',
      effectiveCount: 4,
      hasExtraEffectiveChars: false,
      wasTrimmedAfterLimit: false,
    });
  });

  it('truncates after the tenth effective character while preserving earlier whitespace', () => {
    expect(limitEffectiveChars('天地 玄黃\n宇宙 洪荒 日月盈昃', 10)).toEqual({
      value: '天地 玄黃\n宇宙 洪荒 日月',
      effectiveCount: 10,
      hasExtraEffectiveChars: true,
      wasTrimmedAfterLimit: true,
    });
  });

  it('drops trailing whitespace after the tenth effective character without flagging extra effective characters', () => {
    expect(limitEffectiveChars('天地玄黃宇宙洪荒日月  \n', 10)).toEqual({
      value: '天地玄黃宇宙洪荒日月',
      effectiveCount: 10,
      hasExtraEffectiveChars: false,
      wasTrimmedAfterLimit: true,
    });
  });
});
