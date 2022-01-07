import { InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { NotFoundError } from "rxjs";
import { User } from "src/auth/user.entity";
import { DeleteResult, EntityRepository, Repository } from "typeorm";
import { CreateTaskDto } from "./dto/create-task-dto";
import { GetTasksFilterDto } from "./dto/get-tasks-filter.dto";
import { Task } from "./task.entity";
import { TaskStatus } from "./tasks.status.enum";


@EntityRepository(Task)
export class TasksRepository extends Repository<Task>{

  private logger = new Logger('TasksRepository', {timestamp: true});


  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]>{
    const {status, search} = filterDto;

    const query = this.createQueryBuilder('task');
    query.where({user});

    if(status){
        query.andWhere('task.status = :status', {status});
    }

    if(search){      
      query.andWhere(
          '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
      {search: `%${search}%`},
      );

    }

    try {
      const tasks = await query.getMany();  
      return tasks;
    } catch (error) {
      this.logger.error(error, error.stack);
      throw new InternalServerErrorException();
    }
    
    
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task>{
    const {title, description} = createTaskDto;
    
      const task = this.create({
        title,
        description,
        status: TaskStatus.OPEN,
        user,
      });
    
      await this.save(task);
      return task;
  }

  async deleteTask(id: string): Promise<void>{    
    
      const task = await this.delete({
        id,
      });

      if(task.affected === 0){
        throw new NotFoundException(`Task not found`);
      }
  }
}