import { Module } from '@nestjs/common';
import { Line98Service } from './providers/line98.service';
import { DijkstraProvider } from './providers/dijkstra.provider';
export { Line98Service } from './providers/line98.service'
import { MatrixProvider } from './providers/matrix.provider';
import { SuggestProvider } from './providers/suggest.provider';

@Module({
  providers: [Line98Service, DijkstraProvider, MatrixProvider, SuggestProvider],
  exports: [Line98Service, DijkstraProvider, SuggestProvider],
})
export class Line98Module {}
