// 测试 Supabase 连接（使用统一客户端模块）
import { createClient } from '@/lib/supabase/client'

// GET 请求时测试连接
export async function GET() {
  try {
    const supabase = createClient()

    // 尝试查询数据库版本，验证连接
    const { data, error } = await supabase.rpc('version')

    if (error) {
      // RPC 不存在是正常的，说明连接已通
      if (error.message.includes('function') || error.code === '42883') {
        return Response.json({
          status: '✅ Supabase 连接成功！',
          message: '数据库已连接，统一客户端模块工作正常',
        })
      }
      return Response.json(
        { status: '❌ 有错误', error: error.message },
        { status: 500 }
      )
    }

    return Response.json({ status: '✅ Supabase 完全正常！', data })
  } catch (err) {
    return Response.json(
      { status: '❌ 连接失败', error: String(err) },
      { status: 500 }
    )
  }
}
