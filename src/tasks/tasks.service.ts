import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { TaskStatus } from "./tasks.status.enum";
import { CreateTaskDto } from './dto/create-task-dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TasksRepository } from './tasks.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TasksRepository)
    private taskRepository: TasksRepository
  ){}

  createTask(createTaskDto: CreateTaskDto): Promise<Task>{
    return this.taskRepository.createTask(createTaskDto);
  }

  async getTaskById(id: string): Promise<Task>{
    const found = await this.taskRepository.findOne(id);
    if(!found){
      throw new NotFoundException(`Task Id not found`);
    }
    return found;
  }


  deleteTaskById(id: string): void {
    this.taskRepository.deleteTask(id);
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.getTaskById(id);
    
    task.status = status;

    await this.taskRepository.save(task);
    return task;
  }

  getTasks(filterDto: GetTasksFilterDto): Promise<Task[]>{
    return this.taskRepository.getTasks(filterDto);
  }
}
