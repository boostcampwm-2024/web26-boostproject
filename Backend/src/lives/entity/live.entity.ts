import { CategoryEntity } from 'src/categories/entity/category.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('lives')
export class LiveEntity {
  @PrimaryGeneratedColumn({ name: 'lives_id' })
  id: number;

  @Column({ name: 'categories_id', type: 'int' })
  categoriesId: number;

  @ManyToOne(() => CategoryEntity, category => category.lives)
  @JoinColumn({ name: 'categories_id' })
  category: CategoryEntity;

  @Column({ name: 'channel_id', type: 'varchar', length: 16 })
  channelId: string;

  @Column({ name: 'lives_name', type: 'varchar', length: 50 })
  name: string;

  @Column({ name: 'lives_description', type: 'varchar', length: 50 })
  description: string;

  @Column({ name: 'streaming_key', type: 'varchar', length: 16 })
  streamingKey: string;

  @Column({ name: 'onair', type: 'boolean' })
  onAir: boolean;

  @Column({ name: 'started_at', type: 'datetime', nullable: true })
  startedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
