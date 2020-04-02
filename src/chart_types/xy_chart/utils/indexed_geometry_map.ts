/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License. */

import { Delaunay } from 'd3-delaunay';
import { $Values } from 'utility-types';

import { IndexedGeometry, isPointGeometry } from '../../../utils/geometry';
import { Point } from '../../../utils/point';
import { IndexedGeometryLinearMap } from './indexed_geometry_linear_map';
import { IndexedGeometrySpatialMap } from './indexed_geometry_spatial_map';

export const GeometryType = Object.freeze({
  linear: 'linear' as 'linear',
  spatial: 'spatial' as 'spatial',
});
export type GeometryType = $Values<typeof GeometryType>;

export class IndexedGeometryMap {
  private linearMap = new IndexedGeometryLinearMap();
  private spatialMap = new IndexedGeometrySpatialMap();

  /**
   * Returns triangulation instance to render spatial grid
   *
   * @param bounds
   */
  triangulation(bounds?: Delaunay.Bounds) {
    return this.spatialMap.triangulation(bounds);
  }

  keys(): Array<number> {
    return [...this.linearMap.keys(), ...this.spatialMap.keys()];
  }

  set(geometry: IndexedGeometry, type: GeometryType = GeometryType.linear) {
    if (type === GeometryType.spatial) {
      if (!isPointGeometry(geometry)) {
        throw new Error('Spatial geometry must be PointGeometry');
      }
      this.spatialMap.set([geometry]);
    } else {
      this.linearMap.set(geometry);
    }
  }

  find(x: number | string | null, point: Point, neighbors = true): IndexedGeometry[] {
    if (x === null) {
      return [];
    }

    return [...this.linearMap.find(x), ...this.spatialMap.find(x, point, neighbors)];
  }

  getMergeData() {
    return {
      spatialGeometries: this.spatialMap.getMergeData(),
      linearGeometries: this.linearMap.getMergeData(),
    };
  }

  /**
   * Merge multiple indexedMaps into base indexedMaps
   * @param indexedMaps
   */
  merge(...indexedMaps: IndexedGeometryMap[]) {
    for (const indexedMap of indexedMaps) {
      const { spatialGeometries, linearGeometries } = indexedMap.getMergeData();
      this.spatialMap.set(spatialGeometries);
      linearGeometries.forEach((geometry) => {
        if (Array.isArray(geometry)) {
          geometry.forEach((geometry) => this.linearMap.set(geometry));
        } else {
          this.linearMap.set(geometry);
        }
      });
    }
  }
}
