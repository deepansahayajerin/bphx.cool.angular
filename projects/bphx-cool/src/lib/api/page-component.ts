import { Type, NgModuleRef } from "@angular/core";

/**
 * A page component
 */
export interface PageComponent
{
  component: Type<unknown>;
  moduleRef?: NgModuleRef<unknown>;
}
