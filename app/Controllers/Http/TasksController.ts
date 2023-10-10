import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TaskStatus } from 'Contracts/enums'
import Task from 'App/Models/Task'
import Database from '@ioc:Adonis/Lucid/Database'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class TasksController {
  public async index({ request, response }: HttpContextContract) {
    const inputs = schema.create({
      page: schema.number.optional(),
      pageSize: schema.number.optional(),
    })

    const payload = await request.validate({ schema: inputs })

    const defaultPageSize = 10
    const tasks = await Task.query().paginate(
      payload.page || 1,
      payload.pageSize || defaultPageSize
    )

    const jsonFormattedTasks = tasks.toJSON()

    return response.status(200).send({
      data: jsonFormattedTasks,
      message: null,
    })
  }

  public async create({ request, response }: HttpContextContract) {
    const inputs = schema.create({
      title: schema.string(),
      status: schema.enum.optional(Object.values(TaskStatus)),
    })

    const payload = await request.validate({ schema: inputs })

    const task = await Task.create({
      title: payload.title,
      status: payload.status || TaskStatus.Open,
    })

    return response.status(201).send({
      data: task,
      message: null,
    })
  }

  public async update({ request, params, response }: HttpContextContract) {
    const inputs = schema.create({
      title: schema.string.optional(),
      status: schema.enum.optional(Object.values(TaskStatus)),
    })

    const payload = await request.validate({ schema: inputs })

    const id = params.id

    try {
      const task = await Task.findOrFail(id)

      task.title = payload.title || task.title
      task.status = payload.status || task.status
      const updatedTask = await task.save()

      return response.status(200).send({
        data: updatedTask,
        message: null,
      })
    } catch (error) {
      return response.status(404)
    }
  }

  public async count({ response }: HttpContextContract) {
    const metrics = await Database.from('tasks').groupBy('status').select('status').count({
      count: '*',
    })

    const result: { [key: string]: number } = {}

    metrics.map((i) => {
      const keyName = i.status.replace('_', '') + '_tasks'
      result[keyName] = i.count ? parseInt(i.count, 10) : 0
    })

    Object.values(TaskStatus).forEach((status) => {
      const keyName = status.replace('_', '') + '_tasks'
      if (!result[keyName]) {
        result[keyName] = 0
      }
    })

    return response.status(200).send({
      data: {
        metrics: result,
      },
      message: null,
    })
  }
  public async monthWiseMetrics({ response }: HttpContextContract) {
    const statusWiseMetrics: {
      [status: string]: {
        month_year: string
        [status_count: string]: string // key is status, value is count of that status but in string
      }[]
    } = {}
    const statuses = Object.values(TaskStatus)
    for (const status of statuses) {
      const metrics = await Database.rawQuery(
        `
          SELECT
            TO_CHAR(created_at, 'Month YYYY') AS month_year,
            COUNT(*) FILTER (WHERE status = ?) AS ${status}
          FROM tasks
          GROUP BY month_year
          ORDER BY month_year DESC
        `,
        [status]
      )

      // @ts-ignore-next-line
      statusWiseMetrics[status] = metrics.rows as {
        month_year: string
        [status_count: string]: string // key is status, value is count of that status but in string
      }[]
    }

    const monthYearCombinationArrays = Object.values(statusWiseMetrics).map((i) =>
      i.map((j: { month_year: string; [status_count: string]: string }) => j.month_year)
    )
    const monthYearCombinations = Array.from(
      new Set(monthYearCombinationArrays.reduce((a, b) => a.concat(b), []))
    )
    const sortedMonthYearCombinations = monthYearCombinations.sort((a, b) => {
      const aDate = new Date(a as string)
      const bDate = new Date(b as string)
      return aDate.getTime() - bDate.getTime()
    })

    const finalMetrics: { date: string; metrics: { [statusKey: string]: number } }[] = []

    sortedMonthYearCombinations.map((monthYear) => {
      const metrics = {}
      Object.keys(statusWiseMetrics).map((currentStatus) => {
        const relevantStat = statusWiseMetrics[currentStatus].find(
          (item) => item.month_year === monthYear
        )
        metrics[`${currentStatus.replace('_', '')}_tasks`] = relevantStat?.[currentStatus] || 0
      })
      finalMetrics.push({
        date: monthYear as string,
        metrics,
      })
    })

    return response.status(200).send({
      data: {
        metrics: finalMetrics,
      },
      message: null,
    })
  }
}
