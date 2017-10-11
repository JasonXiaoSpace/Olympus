var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var Reflect;
(function (Reflect) {
    "use strict";
    var hasOwn = Object.prototype.hasOwnProperty;
    // feature test for Symbol support
    var supportsSymbol = typeof Symbol === "function";
    var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
    var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
    var HashMap;
    (function (HashMap) {
        var supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
        var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
        var downLevel = !supportsCreate && !supportsProto;
        // create an object in dictionary mode (a.k.a. "slow" mode in v8)
        HashMap.create = supportsCreate
            ? function () { return MakeDictionary(Object.create(null)); }
            : supportsProto
                ? function () { return MakeDictionary({ __proto__: null }); }
                : function () { return MakeDictionary({}); };
        HashMap.has = downLevel
            ? function (map, key) { return hasOwn.call(map, key); }
            : function (map, key) { return key in map; };
        HashMap.get = downLevel
            ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
            : function (map, key) { return map[key]; };
    })(HashMap || (HashMap = {}));
    // Load global or shim versions of Map, Set, and WeakMap
    var functionPrototype = Object.getPrototypeOf(Function);
    var usePolyfill = typeof process === "object" && process.env && process.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
    var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
    var _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
    var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
    // [[Metadata]] internal slot
    // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
    var Metadata = new _WeakMap();
    /**
      * Applies a set of decorators to a property of a target object.
      * @param decorators An array of decorators.
      * @param target The target object.
      * @param propertyKey (Optional) The property key to decorate.
      * @param attributes (Optional) The property descriptor for the target key.
      * @remarks Decorators are applied in reverse order.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     Example = Reflect.decorate(decoratorsArray, Example);
      *
      *     // property (on constructor)
      *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
      *
      *     // property (on prototype)
      *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
      *
      *     // method (on constructor)
      *     Object.defineProperty(Example, "staticMethod",
      *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
      *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
      *
      *     // method (on prototype)
      *     Object.defineProperty(Example.prototype, "method",
      *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
      *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
      *
      */
    function decorate(decorators, target, propertyKey, attributes) {
        if (!IsUndefined(propertyKey)) {
            if (!IsArray(decorators))
                throw new TypeError();
            if (!IsObject(target))
                throw new TypeError();
            if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
                throw new TypeError();
            if (IsNull(attributes))
                attributes = undefined;
            propertyKey = ToPropertyKey(propertyKey);
            return DecorateProperty(decorators, target, propertyKey, attributes);
        }
        else {
            if (!IsArray(decorators))
                throw new TypeError();
            if (!IsConstructor(target))
                throw new TypeError();
            return DecorateConstructor(decorators, target);
        }
    }
    Reflect.decorate = decorate;
    // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
    // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
    /**
      * A default metadata decorator factory that can be used on a class, class member, or parameter.
      * @param metadataKey The key for the metadata entry.
      * @param metadataValue The value for the metadata entry.
      * @returns A decorator function.
      * @remarks
      * If `metadataKey` is already defined for the target and target key, the
      * metadataValue for that key will be overwritten.
      * @example
      *
      *     // constructor
      *     @Reflect.metadata(key, value)
      *     class Example {
      *     }
      *
      *     // property (on constructor, TypeScript only)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         static staticProperty;
      *     }
      *
      *     // property (on prototype, TypeScript only)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         property;
      *     }
      *
      *     // method (on constructor)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         static staticMethod() { }
      *     }
      *
      *     // method (on prototype)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         method() { }
      *     }
      *
      */
    function metadata(metadataKey, metadataValue) {
        function decorator(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
                throw new TypeError();
            OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        return decorator;
    }
    Reflect.metadata = metadata;
    /**
      * Define a unique metadata entry on the target.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param metadataValue A value that contains attached metadata.
      * @param target The target object on which to define metadata.
      * @param propertyKey (Optional) The property key for the target.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     Reflect.defineMetadata("custom:annotation", options, Example);
      *
      *     // property (on constructor)
      *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
      *
      *     // property (on prototype)
      *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
      *
      *     // method (on constructor)
      *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
      *
      *     // method (on prototype)
      *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
      *
      *     // decorator factory as metadata-producing annotation.
      *     function MyAnnotation(options): Decorator {
      *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
      *     }
      *
      */
    function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
    }
    Reflect.defineMetadata = defineMetadata;
    /**
      * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param propertyKey (Optional) The property key for the target.
      * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.hasMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    function hasMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryHasMetadata(metadataKey, target, propertyKey);
    }
    Reflect.hasMetadata = hasMetadata;
    /**
      * Gets a value indicating whether the target object has the provided metadata key defined.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param propertyKey (Optional) The property key for the target.
      * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    function hasOwnMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
    }
    Reflect.hasOwnMetadata = hasOwnMetadata;
    /**
      * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param propertyKey (Optional) The property key for the target.
      * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    function getMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryGetMetadata(metadataKey, target, propertyKey);
    }
    Reflect.getMetadata = getMetadata;
    /**
      * Gets the metadata value for the provided metadata key on the target object.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param propertyKey (Optional) The property key for the target.
      * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getOwnMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    function getOwnMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
    }
    Reflect.getOwnMetadata = getOwnMetadata;
    /**
      * Gets the metadata keys defined on the target object or its prototype chain.
      * @param target The target object on which the metadata is defined.
      * @param propertyKey (Optional) The property key for the target.
      * @returns An array of unique metadata keys.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getMetadataKeys(Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getMetadataKeys(Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getMetadataKeys(Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getMetadataKeys(Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getMetadataKeys(Example.prototype, "method");
      *
      */
    function getMetadataKeys(target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryMetadataKeys(target, propertyKey);
    }
    Reflect.getMetadataKeys = getMetadataKeys;
    /**
      * Gets the unique metadata keys defined on the target object.
      * @param target The target object on which the metadata is defined.
      * @param propertyKey (Optional) The property key for the target.
      * @returns An array of unique metadata keys.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getOwnMetadataKeys(Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
      *
      */
    function getOwnMetadataKeys(target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryOwnMetadataKeys(target, propertyKey);
    }
    Reflect.getOwnMetadataKeys = getOwnMetadataKeys;
    /**
      * Deletes the metadata entry from the target object with the provided key.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param propertyKey (Optional) The property key for the target.
      * @returns `true` if the metadata entry was found and deleted; otherwise, false.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.deleteMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    function deleteMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        var metadataMap = GetOrCreateMetadataMap(target, propertyKey, /*Create*/ false);
        if (IsUndefined(metadataMap))
            return false;
        if (!metadataMap.delete(metadataKey))
            return false;
        if (metadataMap.size > 0)
            return true;
        var targetMetadata = Metadata.get(target);
        targetMetadata.delete(propertyKey);
        if (targetMetadata.size > 0)
            return true;
        Metadata.delete(target);
        return true;
    }
    Reflect.deleteMetadata = deleteMetadata;
    function DecorateConstructor(decorators, target) {
        for (var i = decorators.length - 1; i >= 0; --i) {
            var decorator = decorators[i];
            var decorated = decorator(target);
            if (!IsUndefined(decorated) && !IsNull(decorated)) {
                if (!IsConstructor(decorated))
                    throw new TypeError();
                target = decorated;
            }
        }
        return target;
    }
    function DecorateProperty(decorators, target, propertyKey, descriptor) {
        for (var i = decorators.length - 1; i >= 0; --i) {
            var decorator = decorators[i];
            var decorated = decorator(target, propertyKey, descriptor);
            if (!IsUndefined(decorated) && !IsNull(decorated)) {
                if (!IsObject(decorated))
                    throw new TypeError();
                descriptor = decorated;
            }
        }
        return descriptor;
    }
    function GetOrCreateMetadataMap(O, P, Create) {
        var targetMetadata = Metadata.get(O);
        if (IsUndefined(targetMetadata)) {
            if (!Create)
                return undefined;
            targetMetadata = new _Map();
            Metadata.set(O, targetMetadata);
        }
        var metadataMap = targetMetadata.get(P);
        if (IsUndefined(metadataMap)) {
            if (!Create)
                return undefined;
            metadataMap = new _Map();
            targetMetadata.set(P, metadataMap);
        }
        return metadataMap;
    }
    // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
    function OrdinaryHasMetadata(MetadataKey, O, P) {
        var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
        if (hasOwn)
            return true;
        var parent = OrdinaryGetPrototypeOf(O);
        if (!IsNull(parent))
            return OrdinaryHasMetadata(MetadataKey, parent, P);
        return false;
    }
    // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
    function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
        if (IsUndefined(metadataMap))
            return false;
        return ToBoolean(metadataMap.has(MetadataKey));
    }
    // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
    function OrdinaryGetMetadata(MetadataKey, O, P) {
        var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
        if (hasOwn)
            return OrdinaryGetOwnMetadata(MetadataKey, O, P);
        var parent = OrdinaryGetPrototypeOf(O);
        if (!IsNull(parent))
            return OrdinaryGetMetadata(MetadataKey, parent, P);
        return undefined;
    }
    // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
    function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
        if (IsUndefined(metadataMap))
            return undefined;
        return metadataMap.get(MetadataKey);
    }
    // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
    function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
        metadataMap.set(MetadataKey, MetadataValue);
    }
    // 3.1.6.1 OrdinaryMetadataKeys(O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
    function OrdinaryMetadataKeys(O, P) {
        var ownKeys = OrdinaryOwnMetadataKeys(O, P);
        var parent = OrdinaryGetPrototypeOf(O);
        if (parent === null)
            return ownKeys;
        var parentKeys = OrdinaryMetadataKeys(parent, P);
        if (parentKeys.length <= 0)
            return ownKeys;
        if (ownKeys.length <= 0)
            return parentKeys;
        var set = new _Set();
        var keys = [];
        for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
            var key = ownKeys_1[_i];
            var hasKey = set.has(key);
            if (!hasKey) {
                set.add(key);
                keys.push(key);
            }
        }
        for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
            var key = parentKeys_1[_a];
            var hasKey = set.has(key);
            if (!hasKey) {
                set.add(key);
                keys.push(key);
            }
        }
        return keys;
    }
    // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
    function OrdinaryOwnMetadataKeys(O, P) {
        var keys = [];
        var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
        if (IsUndefined(metadataMap))
            return keys;
        var keysObj = metadataMap.keys();
        var iterator = GetIterator(keysObj);
        var k = 0;
        while (true) {
            var next = IteratorStep(iterator);
            if (!next) {
                keys.length = k;
                return keys;
            }
            var nextValue = IteratorValue(next);
            try {
                keys[k] = nextValue;
            }
            catch (e) {
                try {
                    IteratorClose(iterator);
                }
                finally {
                    throw e;
                }
            }
            k++;
        }
    }
    // 6 ECMAScript Data Typ0es and Values
    // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
    function Type(x) {
        if (x === null)
            return 1 /* Null */;
        switch (typeof x) {
            case "undefined": return 0 /* Undefined */;
            case "boolean": return 2 /* Boolean */;
            case "string": return 3 /* String */;
            case "symbol": return 4 /* Symbol */;
            case "number": return 5 /* Number */;
            case "object": return x === null ? 1 /* Null */ : 6 /* Object */;
            default: return 6 /* Object */;
        }
    }
    // 6.1.1 The Undefined Type
    // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
    function IsUndefined(x) {
        return x === undefined;
    }
    // 6.1.2 The Null Type
    // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
    function IsNull(x) {
        return x === null;
    }
    // 6.1.5 The Symbol Type
    // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
    function IsSymbol(x) {
        return typeof x === "symbol";
    }
    // 6.1.7 The Object Type
    // https://tc39.github.io/ecma262/#sec-object-type
    function IsObject(x) {
        return typeof x === "object" ? x !== null : typeof x === "function";
    }
    // 7.1 Type Conversion
    // https://tc39.github.io/ecma262/#sec-type-conversion
    // 7.1.1 ToPrimitive(input [, PreferredType])
    // https://tc39.github.io/ecma262/#sec-toprimitive
    function ToPrimitive(input, PreferredType) {
        switch (Type(input)) {
            case 0 /* Undefined */: return input;
            case 1 /* Null */: return input;
            case 2 /* Boolean */: return input;
            case 3 /* String */: return input;
            case 4 /* Symbol */: return input;
            case 5 /* Number */: return input;
        }
        var hint = PreferredType === 3 /* String */ ? "string" : PreferredType === 5 /* Number */ ? "number" : "default";
        var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
        if (exoticToPrim !== undefined) {
            var result = exoticToPrim.call(input, hint);
            if (IsObject(result))
                throw new TypeError();
            return result;
        }
        return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
    }
    // 7.1.1.1 OrdinaryToPrimitive(O, hint)
    // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
    function OrdinaryToPrimitive(O, hint) {
        if (hint === "string") {
            var toString_1 = O.toString;
            if (IsCallable(toString_1)) {
                var result = toString_1.call(O);
                if (!IsObject(result))
                    return result;
            }
            var valueOf = O.valueOf;
            if (IsCallable(valueOf)) {
                var result = valueOf.call(O);
                if (!IsObject(result))
                    return result;
            }
        }
        else {
            var valueOf = O.valueOf;
            if (IsCallable(valueOf)) {
                var result = valueOf.call(O);
                if (!IsObject(result))
                    return result;
            }
            var toString_2 = O.toString;
            if (IsCallable(toString_2)) {
                var result = toString_2.call(O);
                if (!IsObject(result))
                    return result;
            }
        }
        throw new TypeError();
    }
    // 7.1.2 ToBoolean(argument)
    // https://tc39.github.io/ecma262/2016/#sec-toboolean
    function ToBoolean(argument) {
        return !!argument;
    }
    // 7.1.12 ToString(argument)
    // https://tc39.github.io/ecma262/#sec-tostring
    function ToString(argument) {
        return "" + argument;
    }
    // 7.1.14 ToPropertyKey(argument)
    // https://tc39.github.io/ecma262/#sec-topropertykey
    function ToPropertyKey(argument) {
        var key = ToPrimitive(argument, 3 /* String */);
        if (IsSymbol(key))
            return key;
        return ToString(key);
    }
    // 7.2 Testing and Comparison Operations
    // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
    // 7.2.2 IsArray(argument)
    // https://tc39.github.io/ecma262/#sec-isarray
    function IsArray(argument) {
        return Array.isArray
            ? Array.isArray(argument)
            : argument instanceof Object
                ? argument instanceof Array
                : Object.prototype.toString.call(argument) === "[object Array]";
    }
    // 7.2.3 IsCallable(argument)
    // https://tc39.github.io/ecma262/#sec-iscallable
    function IsCallable(argument) {
        // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
        return typeof argument === "function";
    }
    // 7.2.4 IsConstructor(argument)
    // https://tc39.github.io/ecma262/#sec-isconstructor
    function IsConstructor(argument) {
        // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
        return typeof argument === "function";
    }
    // 7.2.7 IsPropertyKey(argument)
    // https://tc39.github.io/ecma262/#sec-ispropertykey
    function IsPropertyKey(argument) {
        switch (Type(argument)) {
            case 3 /* String */: return true;
            case 4 /* Symbol */: return true;
            default: return false;
        }
    }
    // 7.3 Operations on Objects
    // https://tc39.github.io/ecma262/#sec-operations-on-objects
    // 7.3.9 GetMethod(V, P)
    // https://tc39.github.io/ecma262/#sec-getmethod
    function GetMethod(V, P) {
        var func = V[P];
        if (func === undefined || func === null)
            return undefined;
        if (!IsCallable(func))
            throw new TypeError();
        return func;
    }
    // 7.4 Operations on Iterator Objects
    // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
    function GetIterator(obj) {
        var method = GetMethod(obj, iteratorSymbol);
        if (!IsCallable(method))
            throw new TypeError(); // from Call
        var iterator = method.call(obj);
        if (!IsObject(iterator))
            throw new TypeError();
        return iterator;
    }
    // 7.4.4 IteratorValue(iterResult)
    // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
    function IteratorValue(iterResult) {
        return iterResult.value;
    }
    // 7.4.5 IteratorStep(iterator)
    // https://tc39.github.io/ecma262/#sec-iteratorstep
    function IteratorStep(iterator) {
        var result = iterator.next();
        return result.done ? false : result;
    }
    // 7.4.6 IteratorClose(iterator, completion)
    // https://tc39.github.io/ecma262/#sec-iteratorclose
    function IteratorClose(iterator) {
        var f = iterator["return"];
        if (f)
            f.call(iterator);
    }
    // 9.1 Ordinary Object Internal Methods and Internal Slots
    // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
    // 9.1.1.1 OrdinaryGetPrototypeOf(O)
    // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
    function OrdinaryGetPrototypeOf(O) {
        var proto = Object.getPrototypeOf(O);
        if (typeof O !== "function" || O === functionPrototype)
            return proto;
        // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
        // Try to determine the superclass constructor. Compatible implementations
        // must either set __proto__ on a subclass constructor to the superclass constructor,
        // or ensure each class has a valid `constructor` property on its prototype that
        // points back to the constructor.
        // If this is not the same as Function.[[Prototype]], then this is definately inherited.
        // This is the case when in ES6 or when using __proto__ in a compatible browser.
        if (proto !== functionPrototype)
            return proto;
        // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
        var prototype = O.prototype;
        var prototypeProto = prototype && Object.getPrototypeOf(prototype);
        if (prototypeProto == null || prototypeProto === Object.prototype)
            return proto;
        // If the constructor was not a function, then we cannot determine the heritage.
        var constructor = prototypeProto.constructor;
        if (typeof constructor !== "function")
            return proto;
        // If we have some kind of self-reference, then we cannot determine the heritage.
        if (constructor === O)
            return proto;
        // we have a pretty good guess at the heritage.
        return constructor;
    }
    // naive Map shim
    function CreateMapPolyfill() {
        var cacheSentinel = {};
        var arraySentinel = [];
        var MapIterator = (function () {
            function MapIterator(keys, values, selector) {
                this._index = 0;
                this._keys = keys;
                this._values = values;
                this._selector = selector;
            }
            MapIterator.prototype["@@iterator"] = function () { return this; };
            MapIterator.prototype[iteratorSymbol] = function () { return this; };
            MapIterator.prototype.next = function () {
                var index = this._index;
                if (index >= 0 && index < this._keys.length) {
                    var result = this._selector(this._keys[index], this._values[index]);
                    if (index + 1 >= this._keys.length) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    else {
                        this._index++;
                    }
                    return { value: result, done: false };
                }
                return { value: undefined, done: true };
            };
            MapIterator.prototype.throw = function (error) {
                if (this._index >= 0) {
                    this._index = -1;
                    this._keys = arraySentinel;
                    this._values = arraySentinel;
                }
                throw error;
            };
            MapIterator.prototype.return = function (value) {
                if (this._index >= 0) {
                    this._index = -1;
                    this._keys = arraySentinel;
                    this._values = arraySentinel;
                }
                return { value: value, done: true };
            };
            return MapIterator;
        }());
        return (function () {
            function Map() {
                this._keys = [];
                this._values = [];
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
            }
            Object.defineProperty(Map.prototype, "size", {
                get: function () { return this._keys.length; },
                enumerable: true,
                configurable: true
            });
            Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
            Map.prototype.get = function (key) {
                var index = this._find(key, /*insert*/ false);
                return index >= 0 ? this._values[index] : undefined;
            };
            Map.prototype.set = function (key, value) {
                var index = this._find(key, /*insert*/ true);
                this._values[index] = value;
                return this;
            };
            Map.prototype.delete = function (key) {
                var index = this._find(key, /*insert*/ false);
                if (index >= 0) {
                    var size = this._keys.length;
                    for (var i = index + 1; i < size; i++) {
                        this._keys[i - 1] = this._keys[i];
                        this._values[i - 1] = this._values[i];
                    }
                    this._keys.length--;
                    this._values.length--;
                    if (key === this._cacheKey) {
                        this._cacheKey = cacheSentinel;
                        this._cacheIndex = -2;
                    }
                    return true;
                }
                return false;
            };
            Map.prototype.clear = function () {
                this._keys.length = 0;
                this._values.length = 0;
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
            };
            Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
            Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
            Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
            Map.prototype["@@iterator"] = function () { return this.entries(); };
            Map.prototype[iteratorSymbol] = function () { return this.entries(); };
            Map.prototype._find = function (key, insert) {
                if (this._cacheKey !== key) {
                    this._cacheIndex = this._keys.indexOf(this._cacheKey = key);
                }
                if (this._cacheIndex < 0 && insert) {
                    this._cacheIndex = this._keys.length;
                    this._keys.push(key);
                    this._values.push(undefined);
                }
                return this._cacheIndex;
            };
            return Map;
        }());
        function getKey(key, _) {
            return key;
        }
        function getValue(_, value) {
            return value;
        }
        function getEntry(key, value) {
            return [key, value];
        }
    }
    // naive Set shim
    function CreateSetPolyfill() {
        return (function () {
            function Set() {
                this._map = new _Map();
            }
            Object.defineProperty(Set.prototype, "size", {
                get: function () { return this._map.size; },
                enumerable: true,
                configurable: true
            });
            Set.prototype.has = function (value) { return this._map.has(value); };
            Set.prototype.add = function (value) { return this._map.set(value, value), this; };
            Set.prototype.delete = function (value) { return this._map.delete(value); };
            Set.prototype.clear = function () { this._map.clear(); };
            Set.prototype.keys = function () { return this._map.keys(); };
            Set.prototype.values = function () { return this._map.values(); };
            Set.prototype.entries = function () { return this._map.entries(); };
            Set.prototype["@@iterator"] = function () { return this.keys(); };
            Set.prototype[iteratorSymbol] = function () { return this.keys(); };
            return Set;
        }());
    }
    // naive WeakMap shim
    function CreateWeakMapPolyfill() {
        var UUID_SIZE = 16;
        var keys = HashMap.create();
        var rootKey = CreateUniqueKey();
        return (function () {
            function WeakMap() {
                this._key = CreateUniqueKey();
            }
            WeakMap.prototype.has = function (target) {
                var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                return table !== undefined ? HashMap.has(table, this._key) : false;
            };
            WeakMap.prototype.get = function (target) {
                var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                return table !== undefined ? HashMap.get(table, this._key) : undefined;
            };
            WeakMap.prototype.set = function (target, value) {
                var table = GetOrCreateWeakMapTable(target, /*create*/ true);
                table[this._key] = value;
                return this;
            };
            WeakMap.prototype.delete = function (target) {
                var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                return table !== undefined ? delete table[this._key] : false;
            };
            WeakMap.prototype.clear = function () {
                // NOTE: not a real clear, just makes the previous data unreachable
                this._key = CreateUniqueKey();
            };
            return WeakMap;
        }());
        function CreateUniqueKey() {
            var key;
            do
                key = "@@WeakMap@@" + CreateUUID();
            while (HashMap.has(keys, key));
            keys[key] = true;
            return key;
        }
        function GetOrCreateWeakMapTable(target, create) {
            if (!hasOwn.call(target, rootKey)) {
                if (!create)
                    return undefined;
                Object.defineProperty(target, rootKey, { value: HashMap.create() });
            }
            return target[rootKey];
        }
        function FillRandomBytes(buffer, size) {
            for (var i = 0; i < size; ++i)
                buffer[i] = Math.random() * 0xff | 0;
            return buffer;
        }
        function GenRandomBytes(size) {
            if (typeof Uint8Array === "function") {
                if (typeof crypto !== "undefined")
                    return crypto.getRandomValues(new Uint8Array(size));
                if (typeof msCrypto !== "undefined")
                    return msCrypto.getRandomValues(new Uint8Array(size));
                return FillRandomBytes(new Uint8Array(size), size);
            }
            return FillRandomBytes(new Array(size), size);
        }
        function CreateUUID() {
            var data = GenRandomBytes(UUID_SIZE);
            // mark as random - RFC 4122 § 4.4
            data[6] = data[6] & 0x4f | 0x40;
            data[8] = data[8] & 0xbf | 0x80;
            var result = "";
            for (var offset = 0; offset < UUID_SIZE; ++offset) {
                var byte = data[offset];
                if (offset === 4 || offset === 6 || offset === 8)
                    result += "-";
                if (byte < 16)
                    result += "0";
                result += byte.toString(16).toLowerCase();
            }
            return result;
        }
    }
    // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
    function MakeDictionary(obj) {
        obj.__ = undefined;
        delete obj.__;
        return obj;
    }
    // patch global Reflect
    (function (__global) {
        if (typeof __global.Reflect !== "undefined") {
            if (__global.Reflect !== Reflect) {
                for (var p in Reflect) {
                    if (hasOwn.call(Reflect, p)) {
                        __global.Reflect[p] = Reflect[p];
                    }
                }
            }
        }
        else {
            __global.Reflect = Reflect;
        }
    })(typeof global !== "undefined" ? global :
        typeof self !== "undefined" ? self :
            Function("return this;")());
})(Reflect || (Reflect = {}));
//# sourceMappingURL=Reflect.js.map 
/// <reference path="../global/IConstructor.ts"/>
/**
 * @author Raykid
 * @email initial_r@qq.com
 * @create date 2017-09-06
 * @modify date 2017-09-06
 *
 * 这个文件的存在是为了对现有js功能打补丁修bug等
*/
/** 修复Array.findIndex会被遍历到的问题 */
if (Array.prototype.hasOwnProperty("findIndex")) {
    var desc = Object.getOwnPropertyDescriptor(Array.prototype, "findIndex");
    if (desc.enumerable) {
        desc.enumerable = false;
        Object.defineProperty(Array.prototype, "findIndex", desc);
    }
}
/**
 * @author Raykid
 * @email initial_r@qq.com
 * @create date 2017-09-11
 * @modify date 2017-09-11
 *
 * 对象工具集
*/
define("utils/ObjectUtil", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * populate properties
     * @param target        目标obj
     * @param sources       来源obj
     */
    function extendObject(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        sources.forEach(function (source) {
            if (!source)
                return;
            for (var propName in source) {
                if (source.hasOwnProperty(propName)) {
                    target[propName] = source[propName];
                }
            }
        });
        return target;
    }
    exports.extendObject = extendObject;
    /**
     * 复制对象
     * @param target 要复制的对象
     * @param deep 是否深表复制，默认浅表复制
     * @returns {any} 复制后的对象
     */
    function cloneObject(target, deep) {
        if (deep === void 0) { deep = false; }
        if (target == null)
            return null;
        var newObject = {};
        for (var key in target) {
            var value = target[key];
            if (deep && typeof value == "object") {
                // 如果是深表复制，则需要递归复制子对象
                value = cloneObject(value, true);
            }
            newObject[key] = value;
        }
        return newObject;
    }
    exports.cloneObject = cloneObject;
    /**
     * 生成一个随机ID
     */
    function getGUID() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((parseInt(s[19]) & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        return s.join("");
    }
    exports.getGUID = getGUID;
    var _getAutoIncIdMap = {};
    /**
     * 生成自增id（从0开始）
     * @param type
     */
    function getAutoIncId(type) {
        var index = _getAutoIncIdMap[type] || 0;
        _getAutoIncIdMap[type] = index++;
        return type + "-" + index;
    }
    exports.getAutoIncId = getAutoIncId;
    /**
     * 判断对象是否为null或者空对象
     * @param obj 要判断的对象
     * @returns {boolean} 是否为null或者空对象
     */
    function isEmpty(obj) {
        var result = true;
        for (var key in obj) {
            result = false;
            break;
        }
        return result;
    }
    exports.isEmpty = isEmpty;
    /**
     * 移除data中包含的空引用或未定义
     * @param data 要被移除空引用或未定义的对象
     */
    function trimData(data) {
        for (var key in data) {
            if (data[key] == null) {
                delete data[key];
            }
        }
        return data;
    }
    exports.trimData = trimData;
    /**
     * 让child类继承自parent类
     * @param child 子类
     * @param parent 父类
     */
    exports.extendsClass = (function () {
        var extendStatics = Object["setPrototypeOf"] ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (b.hasOwnProperty(p))
                    d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var hash = 0;
    var hashTypes = ["object", "function"];
    /**
     * 获取一个对象的对象哈希字符串
     *
     * @export
     * @param {*} target 任意对象，可以是基础类型或null
     * @returns {string} 哈希值
     */
    function getObjectHash(target) {
        if (target == null)
            return "__object_hash_0__";
        var key = "__object_hash__";
        var value = target[key];
        // 如果已经有哈希值则直接返回
        if (value)
            return value;
        // 如果是基础类型则直接返回对应字符串
        var type = typeof target;
        if (hashTypes.indexOf(type) < 0)
            return type + ":" + target;
        // 如果是复杂类型则返回计算的哈希值并打上标签
        return (target[key] = "__object_hash_" + (++hash) + "__");
    }
    exports.getObjectHash = getObjectHash;
    /**
     * 获取多个对象的哈希字符串，会对每个对象调用getObjectHash生成单个哈希值，并用|连接
     *
     * @export
     * @param {...any[]} targets 希望获取哈希值的对象列表
     * @returns {string} 多个对象共同作用下的哈希值
     */
    function getObjectHashs() {
        var targets = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            targets[_i] = arguments[_i];
        }
        var values = targets.map(function (target) { return getObjectHash(target); });
        return values.join("|");
    }
    exports.getObjectHashs = getObjectHashs;
});
define("utils/Dictionary", ["require", "exports", "utils/ObjectUtil"], function (require, exports, ObjectUtil_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-15
     * @modify date 2017-09-15
     *
     * 字典，支持key为任意类型的对象
    */
    var Dictionary = /** @class */ (function () {
        function Dictionary() {
            this._entity = {};
        }
        Object.defineProperty(Dictionary.prototype, "size", {
            /**
             * 获取字典内的元素数量
             *
             * @readonly
             * @type {number}
             * @memberof Dictionary
             */
            get: function () {
                var size = 0;
                for (var hash in this._entity)
                    size++;
                return size;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 设置一个键值对
         *
         * @param {K} key 键
         * @param {V} value 值
         * @memberof Dictionary
         */
        Dictionary.prototype.set = function (key, value) {
            this._entity[ObjectUtil_1.getObjectHash(key)] = value;
        };
        /**
         * 获取一个值
         *
         * @param {K} key 键
         * @returns {V} 值
         * @memberof Dictionary
         */
        Dictionary.prototype.get = function (key) {
            return this._entity[ObjectUtil_1.getObjectHash(key)];
        };
        /**
         * 删除一个键值对
         *
         * @param {K} key 键
         * @memberof Dictionary
         */
        Dictionary.prototype.delete = function (key) {
            delete this._entity[ObjectUtil_1.getObjectHash(key)];
        };
        return Dictionary;
    }());
    exports.default = Dictionary;
});
define("core/message/IMessage", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("core/message/Message", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-18
     * @modify date 2017-09-18
     *
     * 消息基类
    */
    var Message = /** @class */ (function () {
        function Message(type) {
            this._type = type;
        }
        Object.defineProperty(Message.prototype, "type", {
            /**
             * 获取消息类型字符串
             *
             * @readonly
             * @type {string}
             * @memberof Message
             */
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        return Message;
    }());
    exports.default = Message;
});
define("core/message/CommonMessage", ["require", "exports", "core/message/Message"], function (require, exports, Message_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-01
     * @modify date 2017-09-01
     *
     * 框架内核通用消息
    */
    var CommonMessage = /** @class */ (function (_super) {
        __extends(CommonMessage, _super);
        /**
         * Creates an instance of Message.
         * @param {string} type 消息类型
         * @param {...any[]} params 可能的消息参数列表
         * @memberof Message
         */
        function CommonMessage(type) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            var _this = _super.call(this, type) || this;
            _this.params = params;
            return _this;
        }
        return CommonMessage;
    }(Message_1.default));
    exports.default = CommonMessage;
});
define("core/message/CoreMessage", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-13
     * @modify date 2017-09-13
     *
     * 核心事件类型
    */
    var CoreMessage = /** @class */ (function () {
        function CoreMessage() {
        }
        /**
         * 任何消息派发到框架后都会派发这个消息
         *
         * @static
         * @type {string}
         * @memberof CoreMessage
         */
        CoreMessage.MESSAGE_DISPATCHED = "messageDispatched";
        return CoreMessage;
    }());
    exports.default = CoreMessage;
});
define("core/command/Command", ["require", "exports", "core/Core"], function (require, exports, Core_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-01
     * @modify date 2017-09-01
     *
     * 内核命令类，内核命令在注册了消息后可以在消息派发时被执行
    */
    var Command = /** @class */ (function () {
        function Command(msg) {
            this.msg = msg;
        }
        Command.prototype.dispatch = function (typeOrMsg) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            Core_1.core.dispatch.apply(Core_1.core, [typeOrMsg].concat(params));
        };
        return Command;
    }());
    exports.default = Command;
});
define("core/command/ICommandConstructor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("core/interfaces/IDispatcher", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
/// <reference path="../libs/Reflect.d.ts"/>
/// <reference path="./global/Patch.ts"/>
define("core/Core", ["require", "exports", "core/injector/Injector", "core/message/CommonMessage", "core/message/CoreMessage"], function (require, exports, Injector, CommonMessage_1, CoreMessage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Injector;
    /**
     * 核心上下文对象，负责内核消息消息转发、对象注入等核心功能的实现
     *
     * @export
     * @class Core
     */
    var Core = /** @class */ (function () {
        function Core() {
            /*********************** 下面是内核消息系统 ***********************/
            this._listenerDict = {};
            /*********************** 下面是内核命令系统 ***********************/
            this._commandDict = {};
            // 进行单例判断
            if (Core._instance)
                throw new Error("已生成过Core实例，不允许多次生成");
            // 赋值单例
            Core._instance = this;
            // 注入自身
            this.mapInjectValue(this);
        }
        Core.prototype.handleMessages = function (msg) {
            var listeners1 = this._listenerDict[msg.type];
            var listeners2 = this._listenerDict[msg.constructor.toString()];
            var listeners = (listeners1 && listeners2 ? listeners1.concat(listeners2) : listeners1 || listeners2);
            if (listeners) {
                listeners = listeners.concat();
                for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
                    var temp = listeners_1[_i];
                    try {
                        // 调用处理函数
                        if (msg instanceof CommonMessage_1.default)
                            // 如果是通用消息，则将参数结构后调用回调
                            (_a = temp.handler).call.apply(_a, [temp.thisArg].concat(msg.params));
                        else
                            // 如果是其他消息，则直接将消息体传给回调
                            temp.handler.call(temp.thisArg, msg);
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
            }
            var _a;
        };
        Core.prototype.doDispatch = function (msg) {
            // 触发命令
            this.handleCommands(msg);
            // 触发用listen形式监听的消息
            this.handleMessages(msg);
        };
        /** dispatch方法实现 */
        Core.prototype.dispatch = function (typeOrMsg) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            // 统一消息对象
            var msg = typeOrMsg;
            if (typeof typeOrMsg == "string") {
                msg = new CommonMessage_1.default(typeOrMsg);
                msg.params = params;
            }
            // 派发消息
            this.doDispatch(msg);
            // 额外派发一个通用事件
            this.doDispatch(new CommonMessage_1.default(CoreMessage_1.default.MESSAGE_DISPATCHED, msg));
        };
        /**
         * 监听内核消息
         *
         * @param {string} type 消息类型
         * @param {Function} handler 消息处理函数
         * @param {*} [thisArg] 消息this指向
         * @memberof Core
         */
        Core.prototype.listen = function (type, handler, thisArg) {
            type = (typeof type == "string" ? type : type.toString());
            var listeners = this._listenerDict[type];
            if (!listeners)
                this._listenerDict[type] = listeners = [];
            // 检查存在性
            for (var i = 0, len = listeners.length; i < len; i++) {
                var temp = listeners[i];
                // 如果已经存在监听则直接返回
                if (temp.handler == handler && temp.thisArg == thisArg)
                    return;
            }
            // 添加监听
            listeners.push({ handler: handler, thisArg: thisArg });
        };
        /**
         * 移除内核消息监听
         *
         * @param {string} type 消息类型
         * @param {Function} handler 消息处理函数
         * @param {*} [thisArg] 消息this指向
         * @memberof Core
         */
        Core.prototype.unlisten = function (type, handler, thisArg) {
            type = (typeof type == "string" ? type : type.toString());
            var listeners = this._listenerDict[type];
            // 检查存在性
            if (listeners) {
                for (var i = 0, len = listeners.length; i < len; i++) {
                    var temp = listeners[i];
                    // 如果已经存在监听则直接返回
                    if (temp.handler == handler && temp.thisArg == thisArg) {
                        listeners.splice(i, 1);
                        break;
                    }
                }
            }
        };
        /*********************** 下面是依赖注入系统 ***********************/
        /**
         * 添加一个类型注入，会立即生成一个实例并注入到框架内核中
         *
         * @param {IConstructor} target 要注入的类型（注意不是实例）
         * @param {IConstructor|string} [type] 如果提供该参数，则使用该类型代替注入类型的key，否则使用注入类型自身作为key
         * @memberof Core
         */
        Core.prototype.mapInject = function (target, type) {
            var value = new target();
            this.mapInjectValue(value, type);
        };
        /**
         * 注入一个对象实例
         *
         * @param {*} value 要注入的对象实例
         * @param {IConstructor|string} [type] 如果提供该参数，则使用该类型代替注入类型的key，否则使用注入实例的构造函数作为key
         * @memberof Core
         */
        Core.prototype.mapInjectValue = function (value, type) {
            Reflect.defineMetadata("design:type", value, type || value.constructor);
        };
        /**
         * 移除类型注入
         *
         * @param {IConstructor|string} target 要移除注入的类型
         * @memberof Core
         */
        Core.prototype.unmapInject = function (target) {
            Reflect.deleteMetadata("design:type", target);
        };
        /**
         * 获取注入的对象实例
         *
         * @param {IConstructor|string} type 注入对象的类型
         * @returns {*} 注入的对象实例
         * @memberof Core
         */
        Core.prototype.getInject = function (type) {
            // 需要用原始的构造函数取
            type = type["__ori_constructor__"] || type;
            return Reflect.getMetadata("design:type", type);
        };
        Core.prototype.handleCommands = function (msg) {
            var commands = this._commandDict[msg.type];
            if (commands) {
                commands = commands.concat();
                for (var _i = 0, commands_1 = commands; _i < commands_1.length; _i++) {
                    var cls = commands_1[_i];
                    try {
                        // 执行命令
                        var cmd = new cls(msg);
                        cmd.exec();
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
            }
        };
        /**
         * 注册命令到特定消息类型上，当这个类型的消息派发到框架内核时会触发Command运行
         *
         * @param {string} type 要注册的消息类型
         * @param {(ICommandConstructor)} cmd 命令处理器，可以是方法形式，也可以使类形式
         * @memberof Core
         */
        Core.prototype.mapCommand = function (type, cmd) {
            var commands = this._commandDict[type];
            if (!commands)
                this._commandDict[type] = commands = [];
            if (commands.indexOf(cmd) < 0)
                commands.push(cmd);
        };
        /**
         * 注销命令
         *
         * @param {string} type 要注销的消息类型
         * @param {(ICommandConstructor)} cmd 命令处理器
         * @returns {void}
         * @memberof Core
         */
        Core.prototype.unmapCommand = function (type, cmd) {
            var commands = this._commandDict[type];
            if (!commands)
                return;
            var index = commands.indexOf(cmd);
            if (index < 0)
                return;
            commands.splice(index, 1);
        };
        return Core;
    }());
    exports.default = Core;
    /** 再额外导出一个单例 */
    exports.core = new Core();
});
/// <reference path="../../core/global/IConstructor.ts"/>
define("core/interfaces/IConstructor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("utils/ConstructUtil", ["require", "exports", "utils/ObjectUtil", "utils/Dictionary"], function (require, exports, ObjectUtil_2, Dictionary_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-13
     * @modify date 2017-09-13
     *
     * 装饰器工具集
    */
    var instanceDict = new Dictionary_1.default();
    function handleInstance(instance) {
        var cls = instance.constructor;
        var funcs = instanceDict.get(cls);
        if (funcs)
            for (var _i = 0, funcs_1 = funcs; _i < funcs_1.length; _i++) {
                var func = funcs_1[_i];
                func(instance);
            }
    }
    /**
     * 包装一个类型，监听类型的实例化操作
     *
     * @export
     * @param {IConstructor} cls 要监听构造的类型构造器
     * @returns {IConstructor} 新的构造函数
     */
    function wrapConstruct(cls) {
        // 创建一个新的构造函数
        var func;
        eval('func = function ' + cls["name"] + '(){onConstruct(this)}');
        // 动态设置继承
        ObjectUtil_2.extendsClass(func, cls);
        // 为新的构造函数打一个标签，用以记录原始的构造函数
        func["__ori_constructor__"] = cls;
        // 返回新的构造函数
        return func;
        function onConstruct(instance) {
            // 恢复__proto__
            instance["__proto__"] = cls.prototype;
            // 调用父类构造函数构造实例
            cls.apply(instance, arguments);
            // 调用回调
            handleInstance(instance);
        }
    }
    exports.wrapConstruct = wrapConstruct;
    /**
     * 监听类型的实例化
     *
     * @export
     * @param {IConstructor} cls 要监听实例化的类
     * @param {(instance?:any)=>void} handler 处理函数
     */
    function listenConstruct(cls, handler) {
        var list = instanceDict.get(cls);
        if (!list)
            instanceDict.set(cls, list = []);
        if (list.indexOf(handler) < 0)
            list.push(handler);
    }
    exports.listenConstruct = listenConstruct;
    /**
     * 移除实例化监听
     *
     * @export
     * @param {IConstructor} cls 要移除监听实例化的类
     * @param {(instance?:any)=>void} handler 处理函数
     */
    function unlistenConstruct(cls, handler) {
        var list = instanceDict.get(cls);
        if (list) {
            var index = list.indexOf(handler);
            if (index >= 0)
                list.splice(index, 1);
        }
    }
    exports.unlistenConstruct = unlistenConstruct;
    /**
     * 监听类型销毁（如果能够销毁的话，需要类型具有dispose方法），该监听不需要移除
     *
     * @export
     * @param {IConstructor} cls 要监听销毁的类
     * @param {(instance?:any)=>void} handler 处理函数
     */
    function listenDispose(cls, handler) {
        var dispose = cls.prototype.dispose;
        // 判断类型是否具有dispose方法
        if (dispose) {
            // 替换dispose方法
            cls.prototype.dispose = function () {
                // 调用回调
                handler(this);
                // 调用原始dispose方法执行销毁
                return dispose.apply(this, arguments);
            };
        }
    }
    exports.listenDispose = listenDispose;
});
/// <reference path="./Declaration.ts"/>
define("core/injector/Injector", ["require", "exports", "core/Core", "utils/ConstructUtil", "core/message/Message"], function (require, exports, Core_2, ConstructUtil_1, Message_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function Injectable(cls) {
        var params = cls;
        if (typeof cls == "string" || params.type instanceof Function) {
            // 需要转换注册类型，需要返回一个ClassDecorator
            return function (realCls) {
                Core_2.core.mapInject(realCls, typeof cls == "string" ? cls : params.type);
            };
        }
        else {
            // 不需要转换注册类型，直接注册
            Core_2.core.mapInject(cls);
        }
    }
    exports.Injectable = Injectable;
    ;
    // 赋值全局方法
    window["Injectable"] = Injectable;
    function Inject(target, key) {
        if (key) {
            var cls = Reflect.getMetadata("design:type", target, key);
            doInject(target.constructor, key, cls);
        }
        else {
            return function (prototype, propertyKey) {
                doInject(prototype.constructor, propertyKey, target);
            };
        }
    }
    exports.Inject = Inject;
    ;
    function doInject(cls, key, type) {
        // 监听实例化
        var target;
        ConstructUtil_1.listenConstruct(cls, function (instance) {
            Object.defineProperty(instance, key, {
                configurable: true,
                enumerable: true,
                get: function () { return target || (target = Core_2.core.getInject(type)); }
            });
        });
    }
    // 赋值全局方法
    window["Inject"] = Inject;
    function MessageHandler(target, key) {
        if (key) {
            var defs = Reflect.getMetadata("design:paramtypes", target, key);
            var resClass = defs[0];
            if (!(resClass.prototype instanceof Message_2.default))
                throw new Error("@MessageHandler装饰器装饰的方法的首个参数必须是Message");
            // 监听实例化
            ConstructUtil_1.listenConstruct(target.constructor, function (instance) {
                Core_2.core.listen(resClass, instance[key], instance);
            });
        }
        else {
            return function (prototype, propertyKey, descriptor) {
                // 监听实例化
                ConstructUtil_1.listenConstruct(prototype.constructor, function (instance) {
                    Core_2.core.listen(target, instance[propertyKey], instance);
                });
                // 监听销毁
                ConstructUtil_1.listenDispose(prototype.constructor, function (instance) {
                    Core_2.core.unlisten(target, instance[propertyKey], instance);
                });
            };
        }
    }
    exports.MessageHandler = MessageHandler;
    ;
    // 赋值全局方法
    window["MessageHandler"] = MessageHandler;
});
/// <reference path="../../core/global/IConstructor.ts"/>
define("engine/net/DataType", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-11
     * @modify date 2017-09-11
     *
     * 请求或返回数据结构体
    */
    var DataType = /** @class */ (function () {
        function DataType() {
        }
        /**
         * 解析后端返回的JSON对象，生成结构体
         *
         * @param {any} data 后端返回的JSON对象
         * @returns {DataType} 结构体对象
         * @memberof DataType
         */
        DataType.prototype.parse = function (data) {
            this.__rawData = data;
            this.doParse(data);
            return this;
        };
        return DataType;
    }());
    exports.default = DataType;
});
define("engine/net/IRequestPolicy", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("engine/net/RequestData", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RequestData = /** @class */ (function () {
        function RequestData() {
            /**
             * 用户参数，可以保存任意参数到Message中，该参数中的数据不会被发送
             *
             * @type {*}
             * @memberof RequestData
             */
            this.__userData = {};
        }
        Object.defineProperty(RequestData.prototype, "type", {
            /**
             * 获取请求消息类型字符串
             *
             * @readonly
             * @type {string}
             * @memberof RequestData
             */
            get: function () {
                return this.__params.type;
            },
            enumerable: true,
            configurable: true
        });
        return RequestData;
    }());
    exports.default = RequestData;
    /** 导出公共消息参数对象 */
    exports.commonData = {};
});
define("engine/net/ResponseData", ["require", "exports", "engine/net/DataType"], function (require, exports, DataType_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ResponseData = /** @class */ (function (_super) {
        __extends(ResponseData, _super);
        function ResponseData() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ResponseData;
    }(DataType_1.default));
    exports.default = ResponseData;
});
define("engine/net/NetMessage", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-11
     * @modify date 2017-09-11
     *
     * 通讯相关的消息
    */
    var NetMessage = /** @class */ (function () {
        function NetMessage() {
        }
        /**
         * 发送网络请求消息
         *
         * @static
         * @type {string}
         * @memberof NetMessage
         */
        NetMessage.NET_REQUEST = "netRequest";
        /**
         * 接受网络返回消息
         *
         * @static
         * @type {string}
         * @memberof NetMessage
         */
        NetMessage.NET_RESPONSE = "netResponse";
        /**
         * 网络请求错误消息
         *
         * @static
         * @type {string}
         * @memberof NetMessage
         */
        NetMessage.NET_ERROR = "netError";
        return NetMessage;
    }());
    exports.default = NetMessage;
});
define("engine/net/NetUtil", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-10-09
     * @modify date 2017-10-09
     *
     * 网络工具集，框架内部使用
    */
    function handleObj(obj) {
        if (obj instanceof Array)
            return packArray(obj);
        else if (obj.pack instanceof Function)
            return obj.pack();
        else if (typeof obj == "object")
            return packMap(obj);
        else
            obj;
    }
    function packArray(arr) {
        if (arr == null)
            return null;
        var result = arr.map(handleObj);
        return result;
    }
    exports.packArray = packArray;
    function parseArray(arr, cls) {
        if (arr == null)
            return [];
        // 不支持二维数组嵌套
        var result = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            var value = arr[i];
            if (cls == null) {
                // 子对象是个基础类型
                result.push(value);
            }
            else {
                // 子对象是个自定义类型
                result.push(new cls().parse(value));
            }
        }
        return result;
    }
    exports.parseArray = parseArray;
    function packMap(map) {
        if (map == null)
            return null;
        var result = {};
        for (var key in map) {
            var obj = map[key];
            result[key] = handleObj(obj);
        }
        return result;
    }
    exports.packMap = packMap;
    function parseMap(map, cls) {
        if (map == null)
            return {};
        // 不支持二维数组嵌套
        var result = {};
        for (var key in map) {
            var value = map[key];
            if (cls == null) {
                // 子对象是个基础类型
                result[key] = value;
            }
            else {
                // 子对象是个自定义类型
                result[key] = new cls().parse(value);
            }
        }
        return result;
    }
    exports.parseMap = parseMap;
});
define("engine/net/NetManager", ["require", "exports", "core/Core", "core/injector/Injector", "core/message/CoreMessage", "utils/ObjectUtil", "engine/net/RequestData", "engine/net/NetMessage"], function (require, exports, Core_3, Injector_1, CoreMessage_2, ObjectUtil_3, RequestData_1, NetMessage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NetManager = /** @class */ (function () {
        function NetManager() {
            this._responseDict = {};
            this._responseListeners = {};
            Core_3.core.listen(CoreMessage_2.default.MESSAGE_DISPATCHED, this.onMsgDispatched, this);
        }
        NetManager.prototype.onMsgDispatched = function (msg) {
            // 如果消息是通讯消息则做处理
            if (msg instanceof RequestData_1.default) {
                // 指定消息参数连接上公共参数作为参数
                ObjectUtil_3.extendObject(msg.__params.data, RequestData_1.commonData);
                // 发送消息
                msg.__policy.sendRequest(msg);
                // 派发系统消息
                Core_3.core.dispatch(NetMessage_1.default.NET_REQUEST, msg);
            }
        };
        /**
         * 注册一个返回结构体
         *
         * @param {string} type 返回类型
         * @param {IResponseDataConstructor} cls 返回结构体构造器
         * @memberof NetManager
         */
        NetManager.prototype.registerResponse = function (cls) {
            this._responseDict[cls.type] = cls;
        };
        /**
         * 添加一个通讯返回监听
         *
         * @param {(IResponseDataConstructor|string)} clsOrType 要监听的返回结构构造器或者类型字符串
         * @param {ResponseHandler} handler 回调函数
         * @param {*} [thisArg] this指向
         * @param {boolean} [once=false] 是否一次性监听
         * @memberof NetManager
         */
        NetManager.prototype.listenResponse = function (clsOrType, handler, thisArg, once) {
            if (once === void 0) { once = false; }
            var type = (typeof clsOrType == "string" ? clsOrType : clsOrType.type);
            var listeners = this._responseListeners[type];
            if (!listeners)
                this._responseListeners[type] = listeners = [];
            for (var _i = 0, listeners_2 = listeners; _i < listeners_2.length; _i++) {
                var listener = listeners_2[_i];
                if (handler == listener[0] && thisArg == listener[1] && once == listener[2])
                    return;
            }
            listeners.push([handler, thisArg, once]);
        };
        /**
         * 移除一个通讯返回监听
         *
         * @param {(IResponseDataConstructor|string)} clsOrType 要移除监听的返回结构构造器或者类型字符串
         * @param {ResponseHandler} handler 回调函数
         * @param {*} [thisArg] this指向
         * @param {boolean} [once=false] 是否一次性监听
         * @memberof NetManager
         */
        NetManager.prototype.unlistenResponse = function (clsOrType, handler, thisArg, once) {
            if (once === void 0) { once = false; }
            var type = (typeof clsOrType == "string" ? clsOrType : clsOrType.type);
            var listeners = this._responseListeners[type];
            if (listeners) {
                for (var i = 0, len = listeners.length; i < len; i++) {
                    var listener = listeners[i];
                    if (handler == listener[0] && thisArg == listener[1] && once == listener[2]) {
                        listeners.splice(i, 1);
                        break;
                    }
                }
            }
        };
        /**
         * 发送多条请求，并且等待返回结果（如果有的话），调用回调
         *
         * @param {RequestData[]} [requests 要发送的请求列表
         * @param {(responses?:ResponseData[])=>void} [handler] 收到返回结果后的回调函数
         * @param {*} [thisArg] this指向
         * @memberof NetManager
         */
        NetManager.prototype.sendMultiRequests = function (requests, handler, thisArg) {
            var responses = [];
            var leftResCount = 0;
            for (var _i = 0, _a = requests || []; _i < _a.length; _i++) {
                var request = _a[_i];
                var response = request.__params.response;
                if (response) {
                    // 监听一次性返回
                    this.listenResponse(response, onResponse, this, true);
                    // 记录返回监听
                    responses.push(response);
                    // 记录数量
                    leftResCount++;
                }
                // 发送请求
                Core_3.core.dispatch(request);
            }
            // 测试回调
            testCallback();
            function onResponse(response) {
                for (var key in responses) {
                    var temp = responses[key];
                    if (temp == response.constructor) {
                        responses[key] = response;
                        leftResCount--;
                        // 测试回调
                        testCallback();
                        break;
                    }
                }
            }
            function testCallback() {
                // 判断是否全部替换完毕
                if (leftResCount <= 0) {
                    handler && handler.call(thisArg, responses);
                }
            }
        };
        /** 这里导出不希望用户使用的方法，供框架内使用 */
        NetManager.prototype.__onResponse = function (type, result, request) {
            // 解析结果
            var cls = this._responseDict[type];
            if (cls) {
                var response = new cls();
                // 设置配对请求
                if (request)
                    response.__params.request = request;
                // 执行解析
                response.parse(result);
                // 派发事件
                Core_3.core.dispatch(NetMessage_1.default.NET_RESPONSE, response, request);
                // 触发事件形式监听
                var listeners = this._responseListeners[type];
                if (listeners) {
                    listeners = listeners.concat();
                    for (var _i = 0, listeners_3 = listeners; _i < listeners_3.length; _i++) {
                        var listener = listeners_3[_i];
                        listener[0].call(listener[1], response, request);
                        // 如果是一次性监听则移除之
                        if (listener[2])
                            this.unlistenResponse(type, listener[0], listener[1], listener[2]);
                    }
                }
            }
            else {
                console.warn("没有找到返回结构体定义：" + type);
            }
        };
        NetManager.prototype.__onError = function (err, request) {
            // 派发事件
            Core_3.core.dispatch(NetMessage_1.default.NET_ERROR, err, request);
        };
        NetManager = __decorate([
            Injector_1.Injectable,
            __metadata("design:paramtypes", [])
        ], NetManager);
        return NetManager;
    }());
    exports.default = NetManager;
    /** 再额外导出一个单例 */
    exports.netManager = Core_3.core.getInject(NetManager);
});
define("core/interfaces/IDisposable", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("engine/panel/IPanelPolicy", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("core/interfaces/IOpenClose", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("engine/panel/IPanel", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("engine/panel/IPromptPanel", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-21
     * @modify date 2017-09-21
     *
     * 通用弹窗的各种接口
    */
    var ButtonType;
    (function (ButtonType) {
        ButtonType[ButtonType["normal"] = 0] = "normal";
        ButtonType[ButtonType["important"] = 1] = "important";
    })(ButtonType = exports.ButtonType || (exports.ButtonType = {}));
});
define("engine/scene/IScene", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("engine/scene/IScenePolicy", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("engine/bridge/IBridge", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("engine/bridge/IHasBridge", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("engine/mediator/IMediator", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("engine/module/IModuleConstructor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("engine/module/IModule", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("engine/bridge/BridgeMessage", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 表现层消息
    */
    var BridgeMessage = /** @class */ (function () {
        function BridgeMessage() {
        }
        /**
         * 初始化表现层实例前的消息
         *
         * @static
         * @type {string}
         * @memberof ViewMessage
         */
        BridgeMessage.BRIDGE_BEFORE_INIT = "bridgeBeforeInit";
        /**
         * 初始化表现层实例后的消息
         *
         * @static
         * @type {string}
         * @memberof ViewMessage
         */
        BridgeMessage.BRIDGE_AFTER_INIT = "bridgeAfterInit";
        /**
         * 所有表现层实例都初始化完毕的消息
         *
         * @static
         * @type {string}
         * @memberof ViewMessage
         */
        BridgeMessage.BRIDGE_ALL_INIT = "bridgeAllInit";
        return BridgeMessage;
    }());
    exports.default = BridgeMessage;
});
define("engine/panel/NonePanelPolicy", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 无任何动画的弹出策略，可应用于任何显示层实现
    */
    var NonePanelPolicy = /** @class */ (function () {
        function NonePanelPolicy() {
        }
        NonePanelPolicy.prototype.pop = function (panel, callback, from) {
            setTimeout(callback, 0);
        };
        NonePanelPolicy.prototype.drop = function (panel, callback, from) {
            setTimeout(callback, 0);
        };
        return NonePanelPolicy;
    }());
    exports.NonePanelPolicy = NonePanelPolicy;
    /** 默认导出实例 */
    exports.default = new NonePanelPolicy();
});
define("engine/panel/PanelMessage", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 弹窗相关的消息
    */
    var PanelMessage = /** @class */ (function () {
        function PanelMessage() {
        }
        /**
         * 打开弹窗前的消息
         *
         * @static
         * @type {string}
         * @memberof PanelMessage
         */
        PanelMessage.PANEL_BEFORE_POP = "panelBeforePop";
        /**
         * 打开弹窗后的消息
         *
         * @static
         * @type {string}
         * @memberof PanelMessage
         */
        PanelMessage.PANEL_AFTER_POP = "panelAfterPop";
        /**
         * 关闭弹窗前的消息
         *
         * @static
         * @type {string}
         * @memberof PanelMessage
         */
        PanelMessage.PANEL_BEFORE_DROP = "panelBeforeDrop";
        /**
         * 关闭弹窗后的消息
         *
         * @static
         * @type {string}
         * @memberof PanelMessage
         */
        PanelMessage.PANEL_AFTER_DROP = "panelAfterDrop";
        return PanelMessage;
    }());
    exports.default = PanelMessage;
});
define("engine/scene/NoneScenePolicy", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-08
     * @modify date 2017-09-08
     *
     * 无任何动画的场景策略，可应用于任何显示层实现
    */
    var NoneScenePolicy = /** @class */ (function () {
        function NoneScenePolicy() {
        }
        /**
         * 准备切换场景时调度
         * @param from 切出的场景
         * @param to 切入的场景
         */
        NoneScenePolicy.prototype.prepareSwitch = function (from, to) {
            // 这个策略里啥也不用准备
        };
        /**
         * 切换场景时调度
         * @param from 切出的场景
         * @param to 切入的场景
         * @param callback 切换完毕的回调方法
         */
        NoneScenePolicy.prototype.switch = function (from, to, callback) {
            // 直接延迟到下一帧回调（不能同步回调，否则可能会出问题）
            setTimeout(callback, 0);
        };
        return NoneScenePolicy;
    }());
    exports.NoneScenePolicy = NoneScenePolicy;
    /** 默认导出实例 */
    exports.default = new NoneScenePolicy();
});
define("engine/scene/SceneMessage", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-08
     * @modify date 2017-09-08
     *
     * 场景相关的消息
    */
    var SceneMessage = /** @class */ (function () {
        function SceneMessage() {
        }
        /**
         * 切换场景前的消息
         *
         * @static
         * @type {string}
         * @memberof SceneMessage
         */
        SceneMessage.SCENE_BEFORE_CHANGE = "sceneBeforeChange";
        /**
         * 切换场景后的消息
         *
         * @static
         * @type {string}
         * @memberof SceneMessage
         */
        SceneMessage.SCENE_AFTER_CHANGE = "sceneBeforeChange";
        return SceneMessage;
    }());
    exports.default = SceneMessage;
});
define("utils/SyncUtil", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-08
     * @modify date 2017-09-08
     *
     * 同步工具集，用于对多个
    */
    var _cache = {};
    /**
     * 判断是否正在进行操作
     *
     * @export
     * @param {string} name 队列名
     * @returns {boolean} 队列是否正在操作
     */
    function isOperating(name) {
        var ctx = _cache[name];
        return (ctx != null && ctx.operating);
    }
    exports.isOperating = isOperating;
    /**
     * 开始同步操作，所有传递了相同name的操作会被以队列方式顺序执行
     *
     * @export
     * @param name 一个队列的名字
     * @param {Function} fn 要执行的方法
     * @param {*} [thisArg] 方法this对象
     * @param {...any[]} [args] 方法参数
     */
    function wait(name, fn, thisArg) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var ctx = _cache[name];
        if (ctx == null) {
            _cache[name] = ctx = { operating: false, datas: [] };
        }
        if (ctx.operating) {
            // 队列正在执行，推入缓存
            ctx.datas.push({ fn: fn, thisArg: thisArg, args: args });
        }
        else {
            // 队列没有在执行，直接执行
            ctx.operating = true;
            fn.apply(thisArg, args);
        }
    }
    exports.wait = wait;
    /**
     * 完成一步操作并唤醒后续操作
     *
     * @export
     * @param {string} name 队列名字
     * @returns {void}
     */
    function notify(name) {
        var ctx = _cache[name];
        if (ctx == null || ctx.datas.length <= 0) {
            // 队列执行完了，直接结束
            ctx.operating = false;
            return;
        }
        var data = ctx.datas.shift();
        data.fn.apply(data.thisArg, data.args);
    }
    exports.notify = notify;
});
define("engine/scene/SceneManager", ["require", "exports", "core/Core", "core/injector/Injector", "engine/scene/NoneScenePolicy", "engine/scene/SceneMessage", "utils/SyncUtil"], function (require, exports, Core_4, Injector_2, NoneScenePolicy_1, SceneMessage_1, SyncUtil_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-08
     * @modify date 2017-09-08
     *
     * 弹窗管理器，包含切换场景、push场景、pop场景功能
    */
    var SYNC_NAME = "SceneManager_sync";
    var ChangeType;
    (function (ChangeType) {
        ChangeType[ChangeType["Switch"] = 0] = "Switch";
        ChangeType[ChangeType["Push"] = 1] = "Push";
        ChangeType[ChangeType["Pop"] = 2] = "Pop";
    })(ChangeType || (ChangeType = {}));
    var SceneManager = /** @class */ (function () {
        function SceneManager() {
            this._sceneStack = [];
        }
        Object.defineProperty(SceneManager.prototype, "currentScene", {
            /**
             * 获取当前场景
             *
             * @readonly
             * @type {IScene}
             * @memberof SceneManager
             */
            get: function () {
                return this._sceneStack[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SceneManager.prototype, "activeCount", {
            /**
             * 获取活动场景个数
             *
             * @readonly
             * @type {number}
             * @memberof SceneManager
             */
            get: function () {
                return this._sceneStack.length;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 切换场景，替换当前场景，当前场景会被销毁
         *
         * @param {IScene} scene 要切换到的场景
         * @param {*} [data] 要携带给下一个场景的数据
         * @returns {IScene} 场景本体
         * @memberof SceneManager
         */
        SceneManager.prototype.switch = function (scene, data) {
            var _this = this;
            // 非空判断
            if (scene == null)
                return;
            // 如果切入的是第一个场景，则改用push操作
            if (this.activeCount == 0)
                return this.push(scene, data);
            // 同步执行
            SyncUtil_1.wait(SYNC_NAME, this.doChange, this, this.currentScene, scene, data, scene.policy || scene.bridge.defaultScenePolicy || NoneScenePolicy_1.default, ChangeType.Switch, function () { return _this._sceneStack[0] = scene; });
            return scene;
        };
        /**
         * 推入场景，当前场景不会销毁，而是进入场景栈保存，以后可以通过popScene重新展现
         *
         * @param {IScene} scene 要推入的场景
         * @param {*} [data] 要携带给下一个场景的数据
         * @returns {IScene} 场景本体
         * @memberof SceneManager
         */
        SceneManager.prototype.push = function (scene, data) {
            var _this = this;
            // 非空判断
            if (scene == null)
                return scene;
            // 同步执行
            SyncUtil_1.wait(SYNC_NAME, this.doChange, this, this.currentScene, scene, data, scene.policy || scene.bridge.defaultScenePolicy || NoneScenePolicy_1.default, ChangeType.Push, function () { return _this._sceneStack.unshift(scene); });
            return scene;
        };
        /**
         * 弹出场景，当前场景会被销毁，当前位于栈顶的场景会重新显示
         *
         * @param {IScene} scene 要切换出的场景，如果传入的场景不是当前场景则仅移除指定场景，不会进行切换操作
         * @param {*} [data] 要携带给下一个场景的数据
         * @returns {IScene} 场景本体
         * @memberof SceneManager
         */
        SceneManager.prototype.pop = function (scene, data) {
            // 非空判断
            if (scene == null)
                return scene;
            // 同步执行
            SyncUtil_1.wait(SYNC_NAME, this.doPop, this, scene, data);
            return scene;
        };
        SceneManager.prototype.doPop = function (scene, data) {
            var _this = this;
            // 如果没有足够的场景储备则什么都不做
            if (this.activeCount <= 1) {
                console.log("场景栈中的场景数量不足，无法执行pop操作");
                // 完成步骤
                SyncUtil_1.notify(SYNC_NAME);
                return;
            }
            // 验证是否是当前场景，不是则直接移除，不使用Policy
            var to = this._sceneStack[1];
            var policy = scene.policy || scene.bridge.defaultScenePolicy || NoneScenePolicy_1.default;
            var index = this._sceneStack.indexOf(scene);
            if (index != 0) {
                to = null;
                policy = NoneScenePolicy_1.default;
            }
            // 执行切换
            this.doChange(scene, to, data, policy, ChangeType.Pop, function () {
                // 移除记录
                _this._sceneStack.splice(index, 1);
                // 销毁场景
                scene.dispose();
            });
        };
        SceneManager.prototype.doChange = function (from, to, data, policy, type, complete) {
            // 如果要交替的两个场景不是同一个类型的场景，则切换HTMLWrapper显示，且Policy也采用无切换策略
            if (!from || !to || to.bridge.type != from.bridge.type) {
                from && (from.bridge.htmlWrapper.style.display = "none");
                to && (to.bridge.htmlWrapper.style.display = "");
                policy = NoneScenePolicy_1.default;
            }
            // 获取接口引用
            var prepareFunc;
            var doFunc;
            switch (type) {
                case ChangeType.Switch:
                    prepareFunc = policy.prepareSwitch;
                    doFunc = policy.switch;
                    break;
                case ChangeType.Push:
                    prepareFunc = policy.preparePush || policy.prepareSwitch;
                    doFunc = policy.push || policy.switch;
                    break;
                case ChangeType.Pop:
                    prepareFunc = policy.preparePop || policy.prepareSwitch;
                    doFunc = policy.pop || policy.switch;
                    break;
            }
            // 调用准备接口
            prepareFunc.call(policy, from, to);
            // 添加显示
            to && to.bridge.addChild(to.bridge.sceneLayer, to.skin);
            // 前置处理
            from && from.onBeforeOut(to, data);
            to && to.onBeforeIn(from, data);
            // 派发事件
            Core_4.core.dispatch(SceneMessage_1.default.SCENE_BEFORE_CHANGE, from, to);
            // 调用切换接口
            doFunc.call(policy, from, to, function () {
                // 移除显示
                from && from.bridge.removeChild(from.bridge.sceneLayer, from.skin);
                // 后置处理
                from && from.onAfterOut(to, data);
                to && to.onAfterIn(from, data);
                // 派发事件
                Core_4.core.dispatch(SceneMessage_1.default.SCENE_AFTER_CHANGE, from, to);
                // 调用回调
                complete();
                // 完成步骤
                SyncUtil_1.notify(SYNC_NAME);
            });
        };
        SceneManager = __decorate([
            Injector_2.Injectable
        ], SceneManager);
        return SceneManager;
    }());
    exports.default = SceneManager;
    /** 再额外导出一个单例 */
    exports.sceneManager = Core_4.core.getInject(SceneManager);
});
define("engine/panel/PanelManager", ["require", "exports", "core/Core", "core/injector/Injector", "engine/panel/NonePanelPolicy", "engine/panel/PanelMessage", "engine/panel/IPromptPanel", "engine/scene/SceneManager"], function (require, exports, Core_5, Injector_3, NonePanelPolicy_1, PanelMessage_1, IPromptPanel_1, SceneManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 弹窗管理器，包含弹出弹窗、关闭弹窗、弹窗管理等功能
    */
    var PanelManager = /** @class */ (function () {
        function PanelManager() {
            this._panels = [];
            /************************ 下面是通用弹窗的逻辑 ************************/
            this._promptDict = {};
        }
        /**
         * 获取当前显示的弹窗数组（副本）
         *
         * @param {IConstructor} [cls] 弹窗类型，如果传递该参数则只返回该类型的已打开弹窗，否则将返回所有已打开的弹窗
         * @returns {IPanel[]} 已打开弹窗数组
         * @memberof PanelManager
         */
        PanelManager.prototype.getOpened = function (cls) {
            if (!cls)
                return this._panels.concat();
            else
                return this._panels.filter(function (panel) { return panel.constructor == cls; });
        };
        /**
         * 打开一个弹窗
         *
         * @param {IPanel} panel 要打开的弹窗
         * @param {*} [data] 数据
         * @param {boolean} [isModel=true] 是否模态弹出
         * @param {{x:number, y:number}} [from] 弹出起点位置
         * @returns {IPanel} 返回弹窗对象
         * @memberof PanelManager
         */
        PanelManager.prototype.pop = function (panel, data, isModel, from) {
            if (isModel === void 0) { isModel = true; }
            if (this._panels.indexOf(panel) < 0) {
                var policy = panel.policy || panel.bridge.defaultPanelPolicy || NonePanelPolicy_1.default;
                // 添加显示
                var bridge = panel.bridge;
                bridge.addChild(bridge.panelLayer, panel.skin);
                // 调用回调
                panel.onBeforePop(data, isModel, from);
                // 派发消息
                Core_5.core.dispatch(PanelMessage_1.default.PANEL_BEFORE_POP, panel, isModel, from);
                // 调用策略接口
                policy.pop(panel, function () {
                    // 调用回调
                    panel.onAfterPop(data, isModel, from);
                    // 派发消息
                    Core_5.core.dispatch(PanelMessage_1.default.PANEL_AFTER_POP, panel, isModel, from);
                }, from);
                // 记录
                this._panels.push(panel);
            }
            return panel;
        };
        /**
         * 关闭一个弹窗
         *
         * @param {IPanel} panel 要关闭的弹窗
         * @param {*} [data] 数据
         * @param {{x:number, y:number}} [to] 关闭终点位置
         * @returns {IPanel} 返回弹窗对象
         * @memberof PanelManager
         */
        PanelManager.prototype.drop = function (panel, data, to) {
            var index = this._panels.indexOf(panel);
            if (index >= 0) {
                var policy = panel.policy || panel.bridge.defaultPanelPolicy || NonePanelPolicy_1.default;
                // 调用回调
                panel.onBeforeDrop(data, to);
                // 派发消息
                Core_5.core.dispatch(PanelMessage_1.default.PANEL_BEFORE_DROP, panel, to);
                // 调用策略接口
                policy.drop(panel, function () {
                    // 调用回调
                    panel.onAfterDrop(data, to);
                    // 派发消息
                    Core_5.core.dispatch(PanelMessage_1.default.PANEL_AFTER_DROP, panel, to);
                    // 移除显示
                    var bridge = panel.bridge;
                    bridge.removeChild(bridge.panelLayer, panel.skin);
                    // 销毁弹窗
                    panel.dispose();
                }, to);
                // 移除记录
                this._panels.splice(index, 1);
            }
            return panel;
        };
        /**
         * 注册通用弹窗
         *
         * @param {string} type 通用弹窗要注册到的表现层类型
         * @param {IPromptPanel} prompt 通用弹窗实例
         * @memberof PanelManager
         */
        PanelManager.prototype.registerPrompt = function (type, prompt) {
            this._promptDict[type] = prompt;
        };
        /**
         * 取消注册通用弹窗
         *
         * @param {string} type 要取消注册通用弹窗的表现层类型
         * @memberof PanelManager
         */
        PanelManager.prototype.unregisterPrompt = function (type) {
            delete this._promptDict[type];
        };
        /**
         * @private
         */
        PanelManager.prototype.prompt = function (msgOrParams) {
            var handlers = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                handlers[_i - 1] = arguments[_i];
            }
            var params;
            if (typeof msgOrParams == "string") {
                params = {
                    msg: msgOrParams,
                    handlers: handlers
                };
            }
            else {
                params = msgOrParams;
            }
            // 取到当前场景的类型
            var type = SceneManager_1.sceneManager.currentScene.bridge.type;
            // 用场景类型取到弹窗对象
            var prompt = this._promptDict[type];
            if (prompt == null) {
                // 没有找到当前模块类型关联的通用弹窗类型，改用系统弹窗凑合一下
                alert(params.msg);
                return;
            }
            // 增加默认值
            for (var i in params.handlers) {
                var handler = params.handlers[i];
                if (handler.text == null)
                    handler.text = handler.data;
                if (handler.buttonType == null)
                    handler.buttonType = IPromptPanel_1.ButtonType.normal;
            }
            prompt.update(params);
            // 显示并返回弹窗
            return this.pop(prompt);
        };
        /**
         * 显示警告窗口（只有一个确定按钮）
         *
         * @param {(string|IPromptParams)} msgOrParams 要显示的文本，或者弹窗数据
         * @param {()=>void} [okHandler] 确定按钮点击回调
         * @returns {IPanel} 返回被显示的弹窗
         * @memberof PanelManager
         */
        PanelManager.prototype.alert = function (msgOrParams, okHandler) {
            var params;
            if (typeof msgOrParams == "string") {
                params = { msg: msgOrParams };
            }
            else {
                params = msgOrParams;
            }
            params.handlers = [
                { data: "确定", handler: okHandler, buttonType: IPromptPanel_1.ButtonType.important }
            ];
            return this.prompt(params);
        };
        /**
         * 显示确认窗口（有一个确定按钮和一个取消按钮）
         *
         * @param {(string|IPromptParams)} msgOrParams 要显示的文本，或者弹窗数据
         * @param {()=>void} [okHandler] 确定按钮点击回调
         * @param {()=>void} [cancelHandler] 取消按钮点击回调
         * @returns {IPanel} 返回被显示的弹窗
         * @memberof PanelManager
         */
        PanelManager.prototype.confirm = function (msgOrParams, okHandler, cancelHandler) {
            var params;
            if (typeof msgOrParams == "string") {
                params = { msg: msgOrParams };
            }
            else {
                params = msgOrParams;
            }
            params.handlers = [
                { data: "取消", handler: cancelHandler, buttonType: IPromptPanel_1.ButtonType.normal },
                { data: "确定", handler: okHandler, buttonType: IPromptPanel_1.ButtonType.important }
            ];
            return this.prompt(params);
        };
        PanelManager = __decorate([
            Injector_3.Injectable
        ], PanelManager);
        return PanelManager;
    }());
    exports.default = PanelManager;
    /** 再额外导出一个单例 */
    exports.panelManager = Core_5.core.getInject(PanelManager);
});
define("engine/bridge/BridgeManager", ["require", "exports", "core/Core", "core/injector/Injector", "engine/bridge/BridgeMessage", "engine/panel/PanelManager"], function (require, exports, Core_6, Injector_4, BridgeMessage_1, PanelManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 用来管理所有表现层对象
    */
    var BridgeManager = /** @class */ (function () {
        function BridgeManager() {
            this._bridgeDict = {};
        }
        /**
         * 获取表现层桥实例
         *
         * @param {string} type 表现层类型
         * @returns {IBridge} 表现层桥实例
         * @memberof BridgeManager
         */
        BridgeManager.prototype.getBridge = function (type) {
            var data = this._bridgeDict[type];
            return (data && data[0]);
        };
        /**
         * 通过给出一个显示对象皮肤实例来获取合适的表现层桥实例
         *
         * @param {*} skin 皮肤实例
         * @returns {IBridge|null} 皮肤所属表现层桥实例
         * @memberof BridgeManager
         */
        BridgeManager.prototype.getBridgeBySkin = function (skin) {
            if (skin) {
                // 遍历所有已注册的表现层桥进行判断
                for (var type in this._bridgeDict) {
                    var bridge = this._bridgeDict[type][0];
                    if (bridge.isMySkin(skin))
                        return bridge;
                }
            }
            return null;
        };
        /**
         * 注册一个表现层桥实例到框架中
         *
         * @param {...IBridge[]} bridges 要注册的所有表现层桥
         * @memberof BridgeManager
         */
        BridgeManager.prototype.registerBridge = function () {
            var _this = this;
            var bridges = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                bridges[_i] = arguments[_i];
            }
            // 进行DOM初始化判断
            if (!document.body) {
                var onLoad = function (evt) {
                    window.removeEventListener("load", onLoad);
                    // 重新调用注册方法
                    _this.registerBridge.apply(_this, bridges);
                };
                window.addEventListener("load", onLoad);
                return;
            }
            // 进行初始化
            if (bridges.length > 0) {
                var self = this;
                // 记录
                for (var _a = 0, bridges_1 = bridges; _a < bridges_1.length; _a++) {
                    var bridge = bridges_1[_a];
                    var type = bridge.type;
                    if (!this._bridgeDict[type]) {
                        var data = [bridge, false];
                        this._bridgeDict[type] = data;
                    }
                }
                // 开始初始化
                for (var _b = 0, bridges_2 = bridges; _b < bridges_2.length; _b++) {
                    var bridge = bridges_2[_b];
                    // 派发消息
                    Core_6.core.dispatch(BridgeMessage_1.default.BRIDGE_BEFORE_INIT, bridge);
                    // 注册通用提示框
                    PanelManager_1.panelManager.registerPrompt(bridge.type, bridge.promptPanel);
                    // 初始化该表现层实例
                    if (bridge.init)
                        bridge.init(afterInitBridge);
                    else
                        afterInitBridge(bridge);
                }
            }
            else {
                this.testAllInit();
            }
            function afterInitBridge(bridge) {
                // 派发消息
                Core_6.core.dispatch(BridgeMessage_1.default.BRIDGE_AFTER_INIT, bridge);
                // 设置初始化完毕属性
                var data = self._bridgeDict[bridge.type];
                data[1] = true;
                // 测试是否全部初始化完毕
                self.testAllInit();
            }
        };
        BridgeManager.prototype.testAllInit = function () {
            var allInited = true;
            for (var key in this._bridgeDict) {
                var data = this._bridgeDict[key];
                allInited = allInited && data[1];
            }
            if (allInited)
                Core_6.core.dispatch(BridgeMessage_1.default.BRIDGE_ALL_INIT);
        };
        BridgeManager = __decorate([
            Injector_4.Injectable
        ], BridgeManager);
        return BridgeManager;
    }());
    exports.default = BridgeManager;
    /** 再额外导出一个单例 */
    exports.bridgeManager = Core_6.core.getInject(BridgeManager);
});
/// <reference path="./Declaration.ts"/>
define("engine/injector/Injector", ["require", "exports", "core/Core", "utils/ConstructUtil", "engine/net/ResponseData", "engine/net/NetManager", "engine/bridge/BridgeManager"], function (require, exports, Core_7, ConstructUtil_2, ResponseData_1, NetManager_1, BridgeManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-19
     * @modify date 2017-09-19
     *
     * 负责注入的模块
    */
    /** 定义数据模型，支持实例注入，并且自身也会被注入 */
    function ModelClass(cls) {
        // Model先进行托管
        var result = ConstructUtil_2.wrapConstruct(cls);
        // 然后要注入新生成的类
        Core_7.core.mapInject(result);
        // 返回结果
        return result;
    }
    exports.ModelClass = ModelClass;
    // 赋值全局方法
    window["ModelClass"] = ModelClass;
    /** 定义界面中介者，支持实例注入，并可根据所赋显示对象自动调整所使用的表现层桥 */
    function MediatorClass(cls) {
        // 判断一下Mediator是否有dispose方法，没有的话弹一个警告
        if (!cls.prototype.dispose)
            console.warn("Mediator[" + cls["name"] + "]不具有dispose方法，可能会造成内存问题，请让该Mediator实现IDisposable接口");
        // 替换setSkin方法
        var $skin;
        Object.defineProperty(cls.prototype, "skin", {
            configurable: true,
            enumerable: true,
            get: function () {
                return $skin;
            },
            set: function (value) {
                // 根据skin类型选取表现层桥
                this.bridge = BridgeManager_1.bridgeManager.getBridgeBySkin(value);
                // 记录值
                $skin = value;
            }
        });
        return ConstructUtil_2.wrapConstruct(cls);
    }
    exports.MediatorClass = MediatorClass;
    // 赋值全局方法
    window["MediatorClass"] = MediatorClass;
    /** 定义模块，支持实例注入 */
    function ModuleClass(cls) {
        // 判断一下Module是否有dispose方法，没有的话弹一个警告
        if (!cls.prototype.dispose)
            console.warn("Module[" + cls["name"] + "]不具有dispose方法，可能会造成内存问题，请让该Module实现IDisposable接口");
        return ConstructUtil_2.wrapConstruct(cls);
    }
    exports.ModuleClass = ModuleClass;
    // 赋值全局方法
    window["ModuleClass"] = ModuleClass;
    /** 处理通讯消息返回 */
    function ResponseHandler(prototype, propertyKey) {
        var defs = Reflect.getMetadata("design:paramtypes", prototype, propertyKey);
        var resClass = defs[0];
        if (!(resClass.prototype instanceof ResponseData_1.default))
            throw new Error("@ResponseHandler装饰器装饰的方法的首个参数必须是ResponseData");
        // 监听实例化
        ConstructUtil_2.listenConstruct(prototype.constructor, function (instance) {
            NetManager_1.netManager.listenResponse(defs[0], instance[propertyKey], instance);
        });
        // 监听销毁
        ConstructUtil_2.listenDispose(prototype.constructor, function (instance) {
            NetManager_1.netManager.unlistenResponse(defs[0], instance[propertyKey], instance);
        });
    }
    exports.ResponseHandler = ResponseHandler;
    // 赋值全局方法
    window["ResponseHandler"] = ResponseHandler;
    /** 在Module内托管Mediator */
    function DelegateMediator(prototype, propertyKey) {
        if (prototype.delegateMediator instanceof Function && prototype.undelegateMediator instanceof Function) {
            var mediator;
            return {
                configurable: true,
                enumerable: true,
                get: function () {
                    return mediator;
                },
                set: function (value) {
                    // 取消托管中介者
                    if (mediator) {
                        this.undelegateMediator(mediator);
                    }
                    // 设置中介者
                    mediator = value;
                    // 托管新的中介者
                    if (mediator) {
                        this.delegateMediator(mediator);
                    }
                }
            };
        }
    }
    exports.DelegateMediator = DelegateMediator;
    // 赋值全局方法
    window["DelegateMediator"] = DelegateMediator;
});
/**
 * @author Raykid
 * @email initial_r@qq.com
 * @create date 2017-09-19
 * @modify date 2017-09-19
 *
 * 统一的Injector输出口，所有框架内的装饰器注入方法都可以从这个模块找到
*/
define("Injector", ["require", "exports", "core/injector/Injector", "engine/injector/Injector"], function (require, exports, Injector_5, Injector_6) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    /** 导出core模组的注入方法 */
    __export(Injector_5);
    /** 导出engine模组的注入方法 */
    __export(Injector_6);
});
define("engine/platform/IPlatform", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("engine/platform/WebPlatform", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-21
     * @modify date 2017-09-21
     *
     * 网页平台接口实现类，也是平台接口的默认类
    */
    var WebPlatform = /** @class */ (function () {
        function WebPlatform() {
        }
        WebPlatform.prototype.reload = function () {
            window.location.reload(true);
        };
        return WebPlatform;
    }());
    exports.default = WebPlatform;
});
define("engine/platform/PlatformManager", ["require", "exports", "core/Core", "Injector", "engine/platform/WebPlatform"], function (require, exports, Core_8, Injector_7, WebPlatform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-21
     * @modify date 2017-09-21
     *
     * 平台接口管理器，通过桥接模式统一不同平台的不同接口，从而实现对框架其他模块透明化
    */
    var PlatformManager = /** @class */ (function () {
        function PlatformManager() {
            /**
             * 平台接口实现对象，默认是普通网页平台，也可以根据需要定制
             *
             * @type {IPlatform}
             * @memberof PlatformManager
             */
            this.platform = new WebPlatform_1.default();
        }
        /**
         * 刷新当前页面
         *
         * @memberof PlatformManager
         */
        PlatformManager.prototype.reload = function () {
            this.platform.reload();
        };
        PlatformManager = __decorate([
            Injector_7.Injectable
        ], PlatformManager);
        return PlatformManager;
    }());
    exports.default = PlatformManager;
    /** 再额外导出一个单例 */
    exports.platformManager = Core_8.core.getInject(PlatformManager);
});
define("engine/system/System", ["require", "exports", "core/Core", "core/injector/Injector"], function (require, exports, Core_9, Injector_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 用来记录程序运行时间，并且提供延迟回调或频率回调功能
    */
    var System = /** @class */ (function () {
        function System() {
            // 这里尝试一下TS的Tuple类型——Raykid
            this._nextFrameList = [];
            this._timer = 0;
            var self = this;
            if (requestAnimationFrame instanceof Function) {
                requestAnimationFrame(onRequestAnimationFrame);
            }
            else {
                // 如果不支持requestAnimationFrame则改用setTimeout计时，延迟时间1000/60毫秒
                var startTime = Date.now();
                setInterval(function () {
                    var curTime = Date.now();
                    // 赋值timer
                    self._timer = curTime - startTime;
                    // 调用tick方法
                    self.tick();
                }, 1000 / 60);
            }
            function onRequestAnimationFrame(timer) {
                // 赋值timer，这个方法里无法获取this，因此需要通过注入的静态属性取到自身实例
                self._timer = timer;
                // 调用tick方法
                self.tick();
                // 计划下一次执行
                requestAnimationFrame(onRequestAnimationFrame);
            }
        }
        /**
         * 获取从程序运行到当前所经过的毫秒数
         *
         * @returns {number} 毫秒数
         * @memberof System
         */
        System.prototype.getTimer = function () {
            return this._timer;
        };
        System.prototype.tick = function () {
            // 调用下一帧回调
            for (var i = 0, len = this._nextFrameList.length; i < len; i++) {
                var data = this._nextFrameList.shift();
                data[0].apply(data[1], data[2]);
            }
        };
        /**
         * 在下一帧执行某个方法
         *
         * @param {Function} handler 希望在下一帧执行的某个方法
         * @param {*} [thisArg] this指向
         * @param {...any[]} args 方法参数列表
         * @returns {ICancelable} 可取消的句柄
         * @memberof System
         */
        System.prototype.nextFrame = function (handler, thisArg) {
            var _this = this;
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var data = [handler, thisArg, args];
            this._nextFrameList.push(data);
            return {
                cancel: function () {
                    var index = _this._nextFrameList.indexOf(data);
                    if (index >= 0)
                        _this._nextFrameList.splice(index, 1);
                }
            };
        };
        /**
         * 设置延迟回调
         *
         * @param {number} duration 延迟毫秒值
         * @param {Function} handler 回调函数
         * @param {*} [thisArg] this指向
         * @param {...any[]} args 要传递的参数
         * @returns {ICancelable} 可取消的句柄
         * @memberof System
         */
        System.prototype.setTimeout = function (duration, handler, thisArg) {
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            var startTimer = this._timer;
            // 启动计时器
            var nextFrame = this.nextFrame(tick, this);
            function tick() {
                var delta = this._timer - startTimer;
                if (delta >= duration) {
                    nextFrame = null;
                    handler.apply(thisArg, args);
                }
                else {
                    nextFrame = this.nextFrame(tick, this);
                }
            }
            return {
                cancel: function () {
                    nextFrame && nextFrame.cancel();
                    nextFrame = null;
                }
            };
        };
        /**
         * 设置延时间隔
         *
         * @param {number} duration 延迟毫秒值
         * @param {Function} handler 回调函数
         * @param {*} [thisArg] this指向
         * @param {...any[]} args 要传递的参数
         * @returns {ICancelable} 可取消的句柄
         * @memberof System
         */
        System.prototype.setInterval = function (duration, handler, thisArg) {
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            var timeout = this.setTimeout(duration, onTimeout, this);
            function onTimeout() {
                // 触发回调
                handler.apply(thisArg, args);
                // 继续下一次
                timeout = this.setTimeout(duration, onTimeout, this);
            }
            return {
                cancel: function () {
                    timeout && timeout.cancel();
                    timeout = null;
                }
            };
        };
        System = __decorate([
            Injector_8.Injectable,
            __metadata("design:paramtypes", [])
        ], System);
        return System;
    }());
    exports.default = System;
    /** 再额外导出一个单例 */
    exports.system = Core_9.core.getInject(System);
});
define("engine/model/Model", ["require", "exports", "core/Core"], function (require, exports, Core_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-14
     * @modify date 2017-09-14
     *
     * Model的基类，也可以不继承该基类，因为Model是很随意的东西
    */
    var Model = /** @class */ (function () {
        function Model() {
        }
        Model.prototype.dispatch = function (typeOrMsg) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            Core_10.core.dispatch.apply(Core_10.core, [typeOrMsg].concat(params));
        };
        return Model;
    }());
    exports.default = Model;
});
define("engine/mediator/Mediator", ["require", "exports", "core/Core"], function (require, exports, Core_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-04
     * @modify date 2017-09-04
     *
     * 组件界面中介者基类
    */
    var Mediator = /** @class */ (function () {
        function Mediator(skin) {
            this._disposed = false;
            this._listeners = [];
            if (skin)
                this.skin = skin;
        }
        Object.defineProperty(Mediator.prototype, "disposed", {
            /**
             * 获取中介者是否已被销毁
             *
             * @readonly
             * @type {boolean}
             * @memberof Mediator
             */
            get: function () {
                return this._disposed;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 列出中介者所需的资源数组，可重写
         *
         * @returns {string[]} 资源数组，请根据该Mediator所操作的渲染模组的需求给出资源地址或组名
         * @memberof Mediator
         */
        Mediator.prototype.listAssets = function () {
            return null;
        };
        /**
         * 加载从listAssets中获取到的所有资源，完毕后调用回调函数
         *
         * @param {(err?:Error)=>void} handler 完毕后的回调函数，有错误则给出err，没有则不给
         * @memberof Mediator
         */
        Mediator.prototype.loadAssets = function (handler) {
            this.bridge.loadAssets(this.listAssets(), handler);
        };
        /**
         * 打开，为了实现IOpenClose接口
         *
         * @param {*} [data]
         * @returns {*}
         * @memberof Mediator
         */
        Mediator.prototype.open = function (data) {
            // 暂时啥也不干
        };
        /**
         * 关闭，为了实现IOpenClose接口
         *
         * @param {*} [data]
         * @returns {*}
         * @memberof Mediator
         */
        Mediator.prototype.close = function (data) {
            // 暂时啥也不干
        };
        /**
         * 监听事件，从这个方法监听的事件会在中介者销毁时被自动移除监听
         *
         * @param {*} target 事件目标对象
         * @param {string} type 事件类型
         * @param {Function} handler 事件处理函数
         * @param {*} [thisArg] this指向对象
         * @memberof Mediator
         */
        Mediator.prototype.mapListener = function (target, type, handler, thisArg) {
            for (var i = 0, len = this._listeners.length; i < len; i++) {
                var data = this._listeners[i];
                if (data.target == target && data.type == type && data.handler == handler && data.thisArg == thisArg) {
                    // 已经存在一样的监听，不再监听
                    return;
                }
            }
            // 记录监听
            this._listeners.push({ target: target, type: type, handler: handler, thisArg: thisArg });
            // 调用桥接口
            this.bridge.mapListener(target, type, handler, thisArg);
        };
        /**
         * 注销监听事件
         *
         * @param {*} target 事件目标对象
         * @param {string} type 事件类型
         * @param {Function} handler 事件处理函数
         * @param {*} [thisArg] this指向对象
         * @memberof Mediator
         */
        Mediator.prototype.unmapListener = function (target, type, handler, thisArg) {
            for (var i = 0, len = this._listeners.length; i < len; i++) {
                var data = this._listeners[i];
                if (data.target == target && data.type == type && data.handler == handler && data.thisArg == thisArg) {
                    // 调用桥接口
                    this.bridge.unmapListener(target, type, handler, thisArg);
                    // 移除记录
                    this._listeners.splice(i, 1);
                    break;
                }
            }
        };
        /**
         * 注销所有注册在当前中介者上的事件监听
         *
         * @memberof Mediator
         */
        Mediator.prototype.unmapAllListeners = function () {
            for (var i = 0, len = this._listeners.length; i < len; i++) {
                var data = this._listeners.pop();
                // 调用桥接口
                this.bridge.unmapListener(data.target, data.type, data.handler, data.thisArg);
            }
        };
        Mediator.prototype.dispatch = function (typeOrMsg) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            Core_11.core.dispatch.apply(Core_11.core, [typeOrMsg].concat(params));
        };
        /**
         * 销毁中介者
         *
         * @memberof Mediator
         */
        Mediator.prototype.dispose = function () {
            if (!this._disposed) {
                // 移除显示
                if (this.skin && this.bridge) {
                    var parent = this.bridge.getParent(this.skin);
                    if (parent)
                        this.bridge.removeChild(parent, this.skin);
                }
                // 注销事件监听
                this.unmapAllListeners();
                // 移除表现层桥
                this.bridge = null;
                // 移除皮肤
                this.skin = null;
                // 设置已被销毁
                this._disposed = true;
            }
        };
        return Mediator;
    }());
    exports.default = Mediator;
});
define("engine/panel/PanelMediator", ["require", "exports", "engine/mediator/Mediator", "engine/panel/PanelManager"], function (require, exports, Mediator_1, PanelManager_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 实现了IPanel接口的弹窗中介者基类
    */
    var PanelMediator = /** @class */ (function (_super) {
        __extends(PanelMediator, _super);
        function PanelMediator(skin, policy) {
            var _this = _super.call(this, skin) || this;
            _this.policy = policy;
            return _this;
        }
        /**
         * 弹出当前弹窗（等同于调用PanelManager.pop方法）
         *
         * @param {*} [data] 数据
         * @param {boolean} [isModel] 是否模态弹出（后方UI无法交互）
         * @param {{x:number, y:number}} [from] 弹出点坐标
         * @returns {IPanel} 弹窗本体
         * @memberof PanelMediator
         */
        PanelMediator.prototype.open = function (data, isModel, from) {
            return PanelManager_2.panelManager.pop(this, data, isModel, from);
        };
        /**
         * 关闭当前弹窗（等同于调用PanelManager.drop方法）
         *
         * @param {*} [data] 数据
         * @param {{x:number, y:number}} [to] 关闭点坐标
         * @returns {IPanel} 弹窗本体
         * @memberof PanelMediator
         */
        PanelMediator.prototype.close = function (data, to) {
            return PanelManager_2.panelManager.drop(this, data, to);
        };
        /** 在弹出前调用的方法 */
        PanelMediator.prototype.onBeforePop = function (data, isModel, from) {
            // 可重写
        };
        /** 在弹出后调用的方法 */
        PanelMediator.prototype.onAfterPop = function (data, isModel, from) {
            // 可重写
        };
        /** 在关闭前调用的方法 */
        PanelMediator.prototype.onBeforeDrop = function (data, to) {
            // 可重写
        };
        /** 在关闭后调用的方法 */
        PanelMediator.prototype.onAfterDrop = function (data, to) {
            // 可重写
        };
        return PanelMediator;
    }(Mediator_1.default));
    exports.default = PanelMediator;
});
define("engine/scene/SceneMediator", ["require", "exports", "engine/mediator/Mediator", "engine/scene/SceneManager"], function (require, exports, Mediator_2, SceneManager_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-08
     * @modify date 2017-09-08
     *
     * 实现了IScene接口的场景中介者基类
    */
    var SceneMediator = /** @class */ (function (_super) {
        __extends(SceneMediator, _super);
        function SceneMediator(skin, policy) {
            var _this = _super.call(this, skin) || this;
            _this.policy = policy;
            return _this;
        }
        /**
         * 打开当前场景（相当于调用SceneManager.push方法）
         *
         * @param {*} [data] 数据
         * @returns {IScene} 场景本体
         * @memberof SceneMediator
         */
        SceneMediator.prototype.open = function (data) {
            return SceneManager_2.sceneManager.push(this, data);
        };
        /**
         * 关闭当前场景（相当于调用SceneManager.pop方法）
         *
         * @param {*} [data] 数据
         * @returns {IScene} 场景本体
         * @memberof SceneMediator
         */
        SceneMediator.prototype.close = function (data) {
            return SceneManager_2.sceneManager.pop(this, data);
        };
        /**
         * 切入场景开始前调用
         * @param fromScene 从哪个场景切入
         * @param data 切场景时可能的参数
         */
        SceneMediator.prototype.onBeforeIn = function (fromScene, data) {
            // 可重写
        };
        /**
         * 切入场景开始后调用
         * @param fromScene 从哪个场景切入
         * @param data 切场景时可能的参数
         */
        SceneMediator.prototype.onAfterIn = function (fromScene, data) {
            // 可重写
        };
        /**
         * 切出场景开始前调用
         * @param toScene 要切入到哪个场景
         * @param data 切场景时可能的参数
         */
        SceneMediator.prototype.onBeforeOut = function (toScene, data) {
            // 可重写
        };
        /**
         * 切出场景开始后调用
         * @param toScene 要切入到哪个场景
         * @param data 切场景时可能的参数
         */
        SceneMediator.prototype.onAfterOut = function (toScene, data) {
            // 可重写
        };
        return SceneMediator;
    }(Mediator_2.default));
    exports.default = SceneMediator;
});
define("engine/module/ModuleMessage", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-18
     * @modify date 2017-09-18
     *
     * 模块消息
    */
    var ModuleMessage = /** @class */ (function () {
        function ModuleMessage() {
        }
        /**
         * 切换模块消息
         *
         * @static
         * @type {string}
         * @memberof ModuleMessage
         */
        ModuleMessage.MODULE_CHANGE = "moduleChange";
        /**
         * 加载模块失败消息
         *
         * @static
         * @type {string}
         * @memberof ModuleMessage
         */
        ModuleMessage.MODULE_LOAD_ASSETS_ERROR = "moduleLoadAssetsError";
        return ModuleMessage;
    }());
    exports.default = ModuleMessage;
});
define("engine/module/ModuleManager", ["require", "exports", "core/Core", "core/injector/Injector", "engine/net/NetManager", "engine/module/ModuleMessage"], function (require, exports, Core_12, Injector_9, NetManager_2, ModuleMessage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-14
     * @modify date 2017-09-15
     *
     * 模块管理器，管理模块相关的所有操作。模块具有唯一性，同一时间不可以打开两个相同模块，如果打开则会退回到先前的模块处
    */
    var ModuleManager = /** @class */ (function () {
        function ModuleManager() {
            this._moduleStack = [];
        }
        Object.defineProperty(ModuleManager.prototype, "currentModule", {
            /**
             * 获取当前模块
             *
             * @readonly
             * @type {IModuleConstructor}
             * @memberof ModuleManager
             */
            get: function () {
                var curData = this.getCurrent();
                return (curData && curData[0]);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ModuleManager.prototype, "activeCount", {
            /**
             * 获取活动模块数量
             *
             * @readonly
             * @type {number}
             * @memberof ModuleManager
             */
            get: function () {
                return this._moduleStack.length;
            },
            enumerable: true,
            configurable: true
        });
        ModuleManager.prototype.getIndex = function (cls) {
            for (var i = 0, len = this._moduleStack.length; i < len; i++) {
                if (this._moduleStack[i][0] == cls)
                    return i;
            }
            return -1;
        };
        ModuleManager.prototype.getAfter = function (cls) {
            var result = [];
            for (var _i = 0, _a = this._moduleStack; _i < _a.length; _i++) {
                var module = _a[_i];
                if (module[0] == cls)
                    return result;
                result.push(module);
            }
            return null;
        };
        ModuleManager.prototype.getCurrent = function () {
            return this._moduleStack[0];
        };
        /**
         * 获取模块是否开启中
         *
         * @param {IModuleConstructor} cls 要判断的模块类型
         * @returns {boolean} 是否开启
         * @memberof ModuleManager
         */
        ModuleManager.prototype.isOpened = function (cls) {
            return (this._moduleStack.filter(function (temp) { return temp[0] == cls; }).length > 0);
        };
        /**
         * 打开模块
         *
         * @param {IModuleConstructor} cls 模块类型
         * @param {*} [data] 参数
         * @param {boolean} [replace=false] 是否替换当前模块
         * @memberof ModuleManager
         */
        ModuleManager.prototype.open = function (cls, data, replace) {
            var _this = this;
            if (replace === void 0) { replace = false; }
            // 非空判断
            if (!cls)
                return;
            var after = this.getAfter(cls);
            if (!after) {
                // 尚未打开过，正常开启模块
                var target = new cls();
                // 加载所有已托管中介者的资源
                var mediators = target.getDelegatedMediators().concat();
                var loadMediatorAssets = function () {
                    if (mediators.length > 0) {
                        mediators.shift().loadAssets(loadMediatorAssets);
                    }
                    else {
                        // 调用onOpen接口
                        target.onOpen(data);
                        // 发送所有模块消息
                        var requests = target.listInitRequests();
                        NetManager_2.netManager.sendMultiRequests(requests, function (responses) {
                            var from = this.getCurrent();
                            var fromModule = from && from[1];
                            // 调用onGetResponses接口
                            target.onGetResponses(responses);
                            // 调用onDeactivate接口
                            fromModule && fromModule.onDeactivate(cls, data);
                            // 插入模块
                            this._moduleStack.unshift([cls, target]);
                            // 调用onActivate接口
                            target.onActivate(from && from[0], data);
                            // 如果replace是true，则关掉上一个模块
                            if (replace)
                                this.close(from && from[0]);
                            // 派发消息
                            Core_12.core.dispatch(ModuleMessage_1.default.MODULE_CHANGE, from && from[0], cls);
                        }, _this);
                    }
                };
                loadMediatorAssets();
            }
            else if (after.length > 0) {
                // 已经打开且不是当前模块，先关闭当前模块到目标模块之间的所有模块
                for (var i = 1, len = after.length; i < len; i++) {
                    this.close(after[i][0], data);
                }
                // 最后关闭当前模块，以实现从当前模块直接跳回到目标模块
                this.close(after[0][0], data);
            }
        };
        /**
         * 关闭模块，只有关闭的是当前模块时才会触发onDeactivate和onActivate，否则只会触发onClose
         *
         * @param {IModuleConstructor} cls 模块类型
         * @param {*} [data] 参数
         * @memberof ModuleManager
         */
        ModuleManager.prototype.close = function (cls, data) {
            // 非空判断
            if (!cls)
                return;
            // 数量判断，不足一个模块时不关闭
            if (this.activeCount <= 1)
                return;
            // 存在性判断
            var index = this.getIndex(cls);
            if (index < 0)
                return;
            // 取到目标模块
            var target = this._moduleStack[index][1];
            // 如果是当前模块，则需要调用onDeactivate和onActivate接口，否则不用
            if (index == 0) {
                var to = this._moduleStack[1];
                var toModule = to && to[1];
                // 调用onDeactivate接口
                target.onDeactivate(to && to[0], data);
                // 移除当前模块
                this._moduleStack.shift();
                // 调用onClose接口
                target.onClose(data);
                // 调用onActivate接口
                toModule && toModule.onActivate(cls, data);
                // 派发消息
                Core_12.core.dispatch(ModuleMessage_1.default.MODULE_CHANGE, cls, to && to[0]);
            }
            else {
                // 移除模块
                this._moduleStack.splice(index, 1);
                // 调用onClose接口
                target.onClose(data);
            }
        };
        ModuleManager = __decorate([
            Injector_9.Injectable
        ], ModuleManager);
        return ModuleManager;
    }());
    exports.default = ModuleManager;
    /** 再额外导出一个单例 */
    exports.moduleManager = Core_12.core.getInject(ModuleManager);
});
define("engine/module/Module", ["require", "exports", "core/Core", "utils/Dictionary", "engine/module/ModuleManager"], function (require, exports, Core_13, Dictionary_2, ModuleManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-14
     * @modify date 2017-09-14
     *
     * 模块基类
    */
    var Module = /** @class */ (function () {
        function Module() {
            this._disposed = false;
            this._mediators = [];
            this._disposeDict = new Dictionary_2.default();
        }
        Object.defineProperty(Module.prototype, "disposed", {
            /**
             * 获取是否已被销毁
             *
             * @readonly
             * @type {boolean}
             * @memberof Module
             */
            get: function () {
                return this._disposed;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 列出模块所需CSS资源URL，可以重写
         *
         * @returns {string[]} CSS资源列表
         * @memberof Module
         */
        Module.prototype.listStyleFiles = function () {
            return null;
        };
        /**
         * 列出模块所需JS资源URL，可以重写
         *
         * @returns {string[]} js资源列表
         * @memberof Module
         */
        Module.prototype.listJsFiles = function () {
            return null;
        };
        /**
         * 列出模块初始化请求，可以重写
         *
         * @returns {RequestData[]} 模块的初始化请求列表
         * @memberof Module
         */
        Module.prototype.listInitRequests = function () {
            return null;
        };
        Module.prototype.disposeMediator = function (mediator) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            // 调用原始销毁方法
            this._disposeDict.get(mediator).apply(mediator, args);
            // 取消托管
            this.undelegateMediator(mediator);
            // 如果所有已托管的中介者都已经被销毁，则销毁当前模块
            if (this._mediators.length <= 0)
                this.dispose();
        };
        ;
        /**
         * 托管中介者
         *
         * @param {IMediator} mediator 中介者
         * @memberof Module
         */
        Module.prototype.delegateMediator = function (mediator) {
            if (this._mediators.indexOf(mediator) < 0) {
                // 托管新的中介者
                this._mediators.push(mediator);
                // 篡改dispose方法，以监听其dispose
                this._disposeDict.set(mediator, mediator.dispose);
                mediator.dispose = this.disposeMediator.bind(this, mediator);
            }
        };
        /**
         * 取消托管中介者
         *
         * @param {IMediator} mediator 中介者
         * @memberof Module
         */
        Module.prototype.undelegateMediator = function (mediator) {
            var index = this._mediators.indexOf(mediator);
            if (index >= 0) {
                // 取消托管中介者
                this._mediators.splice(index, 1);
                // 恢复dispose方法，取消监听dispose
                mediator.dispose = this._disposeDict.get(mediator);
                this._disposeDict.delete(mediator);
            }
        };
        /**
         * 获取所有已托管的中介者
         *
         * @returns {IMediator[]} 已托管的中介者
         * @memberof Module
         */
        Module.prototype.getDelegatedMediators = function () {
            return this._mediators;
        };
        /**
         * 当获取到所有消息返回（如果有的话）后调用，建议使用@Handler处理消息返回，可以重写
         *
         * @param {ResponseData[]} responses 收到的所有返回体（如果请求有返回的话）
         * @memberof Module
         */
        Module.prototype.onGetResponses = function (responses) {
        };
        /**
         * 打开模块时调用，可以重写
         *
         * @param {*} [data] 传递给模块的数据
         * @memberof Module
         */
        Module.prototype.onOpen = function (data) {
            // 调用所有已托管中介者的open方法
            for (var _i = 0, _a = this._mediators; _i < _a.length; _i++) {
                var mediator = _a[_i];
                mediator.open(data);
            }
        };
        /**
         * 关闭模块时调用，可以重写
         *
         * @param {*} [data] 传递给模块的数据
         * @memberof Module
         */
        Module.prototype.onClose = function (data) {
            // 调用所有已托管中介者的close方法
            for (var _i = 0, _a = this._mediators; _i < _a.length; _i++) {
                var mediator = _a[_i];
                mediator.close(data);
            }
        };
        /**
         * 模块切换到前台时调用（open之后或者其他模块被关闭时），可以重写
         *
         * @param {IModuleConstructor|undefined} from 从哪个模块切换过来
         * @param {*} [data] 传递给模块的数据
         * @memberof Module
         */
        Module.prototype.onActivate = function (from, data) {
        };
        /**
         * 模块切换到后台是调用（close之后或者其他模块打开时），可以重写
         *
         * @param {IModuleConstructor|undefined} to 要切换到哪个模块
         * @param {*} [data] 传递给模块的数据
         * @memberof Module
         */
        Module.prototype.onDeactivate = function (to, data) {
        };
        Module.prototype.dispatch = function (typeOrMsg) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            Core_13.core.dispatch.apply(Core_13.core, [typeOrMsg].concat(params));
        };
        /**
         * 销毁模块，可以重写
         *
         * @memberof Module
         */
        Module.prototype.dispose = function () {
            // 关闭自身
            var cls = this.constructor;
            ModuleManager_1.moduleManager.close(cls);
            // 如果没关上则不销毁
            if (ModuleManager_1.moduleManager.isOpened(cls))
                return;
            // 将所有已托管的中介者销毁
            for (var i = 0, len = this._mediators.length; i < len; i++) {
                var mediator = this._mediators.pop();
                this.undelegateMediator(mediator);
                mediator.dispose();
            }
            // 记录
            this._disposed = true;
        };
        return Module;
    }());
    exports.default = Module;
});
define("utils/URLUtil", ["require", "exports", "utils/ObjectUtil"], function (require, exports, ObjectUtil_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * 规整url
     * @param url
     */
    function trimURL(url) {
        // 去除多余的"/"
        url = url.replace(/([^:/])(\/)+/g, "$1/");
        if (url.charAt(0) == "/")
            url = url.substr(1);
        // 处理"/xx/../"
        var reg = /\/[^\/\.]+?\/\.\.\//;
        while (reg.test(url)) {
            url = url.replace(reg, "/");
        }
        return url;
    }
    exports.trimURL = trimURL;
    /**
     * 检查URL是否是绝对路径（具有协议头）
     * @param url 要判断的URL
     * @returns {any} 是否是绝对路径
     */
    function isAbsolutePath(url) {
        if (url == null)
            return false;
        return (url.indexOf("://") >= 0);
    }
    exports.isAbsolutePath = isAbsolutePath;
    /**
     * 如果url有protocol，使其与当前域名的protocol统一，否则会跨域
     * @param url 要统一protocol的url
     */
    function validateProtocol(url) {
        if (url == null)
            return null;
        var index = url.indexOf("://");
        if (index < 0)
            return url;
        var protocol = url.substring(0, index);
        // 调整http和https
        if (protocol == "http" || protocol == "https") {
            return window.location.protocol + url.substr(index + 1);
        }
        // 调整ws和wss
        if (protocol == "ws" || protocol == "wss") {
            if (window.location.protocol == "https:")
                protocol = "wss";
            else
                protocol = "ws";
            return protocol + url.substr(index);
        }
        // 不需要调整
        return url;
    }
    exports.validateProtocol = validateProtocol;
    /**
     * 替换url中的host
     * @param url       url
     * @param host      要替换的host
     * @param forced    是否强制替换（默认false）
     */
    function wrapHost(url, host, forced) {
        if (forced === void 0) { forced = false; }
        host = host || window.location.origin;
        var re = /^(?:[^\/]+):\/{2,}(?:[^\/]+)\//;
        var arr = url.match(re);
        if (arr && arr.length > 0) {
            if (forced) {
                url = url.substr(arr[0].length);
                url = host + "/" + url;
            }
        }
        else {
            url = wrapAbsolutePath(url, host);
        }
        // 最后规整一下url
        url = trimURL(url);
        return url;
    }
    exports.wrapHost = wrapHost;
    /**
     * 将相对于当前页面的相对路径包装成绝对路径
     * @param relativePath 相对于当前页面的相对路径
     * @param host 传递该参数会用该host替换当前host
     */
    function wrapAbsolutePath(relativePath, host) {
        // 获取当前页面的url
        var curPath = getPath(window.location.href);
        var url = trimURL(curPath + "/" + relativePath);
        if (host != null) {
            url = wrapHost(url, host, true);
        }
        return url;
    }
    exports.wrapAbsolutePath = wrapAbsolutePath;
    /**
     * 获取URL的host+pathname部分，即问号(?)以前的部分
     *
     */
    function getHostAndPathname(url) {
        if (url == null)
            throw new Error("url不能为空");
        // 去掉get参数和hash
        url = url.split("#")[0].split("?")[0];
        // 去掉多余的/
        url = trimURL(url);
        return url;
    }
    exports.getHostAndPathname = getHostAndPathname;
    /**
     * 获取URL路径（文件名前的部分）
     * @param url 要分析的URL
     */
    function getPath(url) {
        // 首先去掉多余的/
        url = getHostAndPathname(url);
        // 然后获取到路径
        var urlArr = url.split("/");
        urlArr.pop();
        return urlArr.join("/") + "/";
    }
    exports.getPath = getPath;
    /**
     * 获取URL的文件名
     * @param url 要分析的URL
     */
    function getName(url) {
        // 先去掉get参数和hash
        url = url.split("#")[0].split("?")[0];
        // 然后获取到文件名
        var urlArr = url.split("/");
        var fileName = urlArr[urlArr.length - 1];
        return fileName;
    }
    exports.getName = getName;
    /**
     * 解析URL
     * @param url 要被解析的URL字符串
     * @returns {any} 解析后的URLLocation结构体
     */
    function parseUrl(url) {
        var regExp = /(([^:]+:)\/\/(([^:\/\?#]+)(:(\d+))?))(\/[^?#]*)?(\?[^#]*)?(#.*)?/;
        var match = regExp.exec(url);
        if (match) {
            return {
                href: match[0] || "",
                origin: match[1] || "",
                protocol: match[2] || "",
                host: match[3] || "",
                hostname: match[4] || "",
                port: match[6] || "",
                pathname: match[7] || "",
                search: match[8] || "",
                hash: (match[9] == "#" ? "" : match[9]) || ""
            };
        }
        else {
            throw new Error("传入parseUrl方法的参数不是一个完整的URL：" + url);
        }
    }
    exports.parseUrl = parseUrl;
    /**
     * 解析url查询参数
     * @TODO 添加对jquery编码方式的支持
     * @param url url
     */
    function getQueryParams(url) {
        var index = url.indexOf("#");
        if (index >= 0) {
            url = url.substring(0, index);
        }
        index = url.indexOf("?");
        if (index < 0)
            return {};
        var queryString = url.substring(index + 1);
        var params = {};
        var kvs = queryString.split("&");
        kvs.forEach(function (kv) {
            var pair = kv.split("=", 2);
            if (pair.length !== 2 || !pair[0]) {
                console.log("[URLUtil] invalid query params: " + kv);
                return;
            }
            var name = decodeURIComponent(pair[0]);
            var value = decodeURIComponent(pair[1]);
            params[name] = value;
        });
        return params;
    }
    exports.getQueryParams = getQueryParams;
    /**
     * 将参数连接到指定URL后面
     * @param url url
     * @param params 一个map，包含要连接的参数
     * @return string 连接后的URL地址
     */
    function joinQueryParams(url, params) {
        if (url == null)
            throw new Error("url不能为空");
        var oriParams = getQueryParams(url);
        var targetParams = ObjectUtil_4.extendObject(oriParams, params);
        var hash = parseUrl(url).hash;
        url = getHostAndPathname(url);
        var isFirst = true;
        for (var key in targetParams) {
            if (isFirst) {
                url += "?" + encodeURIComponent(key) + "=" + encodeURIComponent(targetParams[key]);
                isFirst = false;
            }
            else {
                url += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(targetParams[key]);
            }
        }
        // 加上hash
        url += hash;
        return url;
    }
    exports.joinQueryParams = joinQueryParams;
    /**
     * 将参数链接到URL的hash后面
     * @param url 如果传入的url没有注明hash模块，则不会进行操作
     * @param params 一个map，包含要连接的参数
     */
    function joinHashParams(url, params) {
        if (url == null)
            throw new Error("url不能为空");
        var hash = parseUrl(url).hash;
        if (hash == null || hash == "")
            return url;
        for (var key in params) {
            var value = params[key];
            if (value && typeof value != "string")
                value = value.toString();
            hash += ((hash.indexOf("?") < 0 ? "?" : "&") + encodeURIComponent(key) + "=" + encodeURIComponent(value));
        }
        return (url.split("#")[0] + hash);
    }
    exports.joinHashParams = joinHashParams;
});
define("engine/env/Environment", ["require", "exports", "core/Core", "Injector", "utils/URLUtil"], function (require, exports, Core_14, Injector_10, URLUtil_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-21
     * @modify date 2017-09-21
     *
     * 环境参数
    */
    var Environment = /** @class */ (function () {
        function Environment() {
        }
        Object.defineProperty(Environment.prototype, "env", {
            /**
             * 获取当前环境字符串
             *
             * @readonly
             * @type {string}
             * @memberof Environment
             */
            get: function () {
                return this._env;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 获取当前环境下某索引处的消息域名
         *
         * @param {number} [index=0] 域名字典索引，默认是0
         * @returns {string} 域名字符串，如果取不到则使用当前域名
         * @memberof Environment
         */
        Environment.prototype.getHost = function (index) {
            if (index === void 0) { index = 0; }
            var hosts = this._hostsDict[this._env];
            if (!hosts)
                return window.location.origin;
            return (hosts[index] || window.location.origin);
        };
        Object.defineProperty(Environment.prototype, "curCDNHost", {
            /**
             * 获取当前使用的CDN域名
             *
             * @readonly
             * @type {string}
             * @memberof Environment
             */
            get: function () {
                var cdns = this._cdnsDict[this._env];
                if (!cdns)
                    return window.location.origin;
                return (cdns[this._curCDNIndex] || window.location.origin);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 切换下一个CDN
         *
         * @returns {boolean} 是否已经到达CDN列表的终点，回到了起点
         * @memberof Environment
         */
        Environment.prototype.nextCDN = function () {
            var cdns = this._cdnsDict[this._env];
            if (!cdns)
                return true;
            this._curCDNIndex++;
            if (this._curCDNIndex >= cdns.length) {
                this._curCDNIndex = 0;
                return true;
            }
            return false;
        };
        /**
         * 初始化Environment对象，因为该对象保存的数据基本来自项目初始参数，所以必须有initialize方法
         *
         * @param {string} [env] 当前所属环境字符串
         * @param {{[env:string]:string[]}} [hostsDict] host数组字典
         * @param {{[env:string]:string[]}} [cdnsDict] cdn数组字典
         * @memberof Environment
         */
        Environment.prototype.initialize = function (env, hostsDict, cdnsDict) {
            this._env = env || "dev";
            this._hostsDict = hostsDict || {};
            this._cdnsDict = cdnsDict || {};
            this._curCDNIndex = 0;
        };
        /**
         * 让url的域名变成消息域名
         *
         * @param {string} url 要转变的url
         * @param {number} [index=0] host索引，默认0
         * @returns {string} 转变后的url
         * @memberof Environment
         */
        Environment.prototype.toHostURL = function (url, index) {
            if (index === void 0) { index = 0; }
            // 加上domain
            url = URLUtil_1.wrapHost(url, this.getHost(index));
            // 统一protocol
            url = URLUtil_1.validateProtocol(url);
            // 规整一下
            url = URLUtil_1.trimURL(url);
            // 返回url
            return url;
        };
        /**
         * 让url的域名变成CDN域名
         *
         * @param {string} url 要转变的url
         * @returns {string} 转变后的url
         * @memberof Environment
         */
        Environment.prototype.toCDNHostURL = function (url) {
            // 加上domain
            url = URLUtil_1.wrapHost(url, this.curCDNHost);
            // 统一protocol
            url = URLUtil_1.validateProtocol(url);
            // 规整一下
            url = URLUtil_1.trimURL(url);
            // 返回url
            return url;
        };
        Environment = __decorate([
            Injector_10.Injectable
        ], Environment);
        return Environment;
    }());
    exports.default = Environment;
    /** 再额外导出一个单例 */
    exports.environment = Core_14.core.getInject(Environment);
});
define("engine/env/Explorer", ["require", "exports", "core/Core", "core/injector/Injector"], function (require, exports, Core_15, Injector_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-05
     * @modify date 2017-09-05
     *
     * Explorer类记录浏览器相关数据
    */
    /**
     * 浏览器类型枚举
     *
     * @enum {number}
     */
    var ExplorerType;
    (function (ExplorerType) {
        ExplorerType[ExplorerType["IE"] = 0] = "IE";
        ExplorerType[ExplorerType["EDGE"] = 1] = "EDGE";
        ExplorerType[ExplorerType["OPERA"] = 2] = "OPERA";
        ExplorerType[ExplorerType["FIREFOX"] = 3] = "FIREFOX";
        ExplorerType[ExplorerType["SAFARI"] = 4] = "SAFARI";
        ExplorerType[ExplorerType["CHROME"] = 5] = "CHROME";
        ExplorerType[ExplorerType["OTHERS"] = 6] = "OTHERS";
    })(ExplorerType = exports.ExplorerType || (exports.ExplorerType = {}));
    var Explorer = /** @class */ (function () {
        function Explorer() {
            //取得浏览器的userAgent字符串
            var userAgent = navigator.userAgent;
            // 判断浏览器类型
            var regExp;
            var result;
            if (window["ActiveXObject"] != null) {
                // IE浏览器
                this._type = ExplorerType.IE;
                // 获取IE版本号
                regExp = new RegExp("MSIE ([^ ;\\)]+);");
                result = regExp.exec(userAgent);
                if (result != null) {
                    // 是IE8以前
                    this._version = result[1];
                }
                else {
                    // 是IE9以后
                    regExp = new RegExp("rv:([^ ;\\)]+)");
                    result = regExp.exec(userAgent);
                    this._version = result[1];
                }
            }
            else if (userAgent.indexOf("Edge") > -1) {
                // Edge浏览器
                this._type = ExplorerType.EDGE;
                // 获取Edge版本号
                regExp = new RegExp("Edge/([^ ;\\)]+)");
                result = regExp.exec(userAgent);
                this._version = result[1];
            }
            else if (userAgent.indexOf("Firefox") > -1) {
                // Firefox浏览器
                this._type = ExplorerType.FIREFOX;
                // 获取Firefox版本号
                regExp = new RegExp("Firefox/([^ ;\\)]+)");
                result = regExp.exec(userAgent);
                this._version = result[1];
            }
            else if (userAgent.indexOf("Opera") > -1) {
                // Opera浏览器
                this._type = ExplorerType.OPERA;
                // 获取Opera版本号
                regExp = new RegExp("OPR/([^ ;\\)]+)");
                result = regExp.exec(userAgent);
                this._version = result[1];
            }
            else if (userAgent.indexOf("Chrome") > -1) {
                // Chrome浏览器
                this._type = ExplorerType.CHROME;
                // 获取Crhome版本号
                regExp = new RegExp("Chrome/([^ ;\\)]+)");
                result = regExp.exec(userAgent);
                this._version = result[1];
            }
            else if (userAgent.indexOf("Safari") > -1) {
                // Safari浏览器
                this._type = ExplorerType.SAFARI;
                // 获取Safari版本号
                regExp = new RegExp("Safari/([^ ;\\)]+)");
                result = regExp.exec(userAgent);
                this._version = result[1];
            }
            else {
                // 其他浏览器
                this._type = ExplorerType.OTHERS;
                // 随意设置一个版本号
                this._version = "0.0";
            }
            // 赋值类型字符串
            this._typeStr = ExplorerType[this._type];
            // 赋值大版本号
            this._bigVersion = this._version.split(".")[0];
        }
        Object.defineProperty(Explorer.prototype, "type", {
            /**
             * 获取浏览器类型枚举值
             *
             * @readonly
             * @type {ExplorerType}
             * @memberof Explorer
             */
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Explorer.prototype, "typeStr", {
            /**
             * 获取浏览器类型字符串
             *
             * @readonly
             * @type {string}
             * @memberof Explorer
             */
            get: function () {
                return this._typeStr;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Explorer.prototype, "version", {
            /**
             * 获取浏览器版本
             *
             * @readonly
             * @type {string}
             * @memberof Explorer
             */
            get: function () {
                return this._version;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Explorer.prototype, "bigVersion", {
            /**
             * 获取浏览器大版本
             *
             * @readonly
             * @type {string}
             * @memberof Explorer
             */
            get: function () {
                return this._bigVersion;
            },
            enumerable: true,
            configurable: true
        });
        Explorer = __decorate([
            Injector_11.Injectable,
            __metadata("design:paramtypes", [])
        ], Explorer);
        return Explorer;
    }());
    exports.default = Explorer;
    /** 再额外导出一个单例 */
    exports.explorer = Core_15.core.getInject(Explorer);
});
define("engine/env/WindowExternal", ["require", "exports", "core/Core", "core/injector/Injector"], function (require, exports, Core_16, Injector_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-05
     * @modify date 2017-09-05
     *
     * External类为window.external参数字典包装类
    */
    var WindowExternal = /** @class */ (function () {
        function WindowExternal() {
            this._params = {};
            // 处理window.external
            try {
                if (!(window.external && typeof window.external === "object")) {
                    window.external = {};
                }
            }
            catch (err) {
                window.external = {};
            }
            this._params = window.external;
        }
        /**
         * 获取window.external中的参数
         *
         * @param {string} key 参数名
         * @returns {*} 参数值
         * @memberof External
         */
        WindowExternal.prototype.getParam = function (key) {
            return this._params[key];
        };
        WindowExternal = __decorate([
            Injector_12.Injectable,
            __metadata("design:paramtypes", [])
        ], WindowExternal);
        return WindowExternal;
    }());
    exports.default = WindowExternal;
    /** 再额外导出一个单例 */
    exports.windowExternal = Core_16.core.getInject(WindowExternal);
});
define("engine/env/Hash", ["require", "exports", "core/Core", "core/injector/Injector"], function (require, exports, Core_17, Injector_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * Hash类是地址路由（网页哈希）管理器，规定哈希格式为：#[模块名]?[参数名]=[参数值]&[参数名]=[参数值]&...
    */
    var Hash = /** @class */ (function () {
        function Hash() {
            this._params = {};
            this._direct = false;
            this._keepHash = false;
            this._hash = window.location.hash;
            var reg = /#([^\?&]+)(\?([^\?&=]+=[^\?&=]+)(&([^\?&=]+=[^\?&=]+))*)?/;
            var result = reg.exec(this._hash);
            if (result) {
                // 解析模块名称
                this._moduleName = result[1];
                // 解析模块参数
                var paramsStr = result[2];
                if (paramsStr != null) {
                    paramsStr = paramsStr.substr(1);
                    var params = paramsStr.split("&");
                    for (var i = 0, len = params.length; i < len; i++) {
                        var pair = params[i];
                        if (pair != null) {
                            var temp = pair.split("=");
                            // 键和值都要做一次URL解码
                            var key = decodeURIComponent(temp[0]);
                            var value = decodeURIComponent(temp[1]);
                            this._params[key] = value;
                        }
                    }
                }
                // 处理direct参数
                this._direct = (this._params.direct == "true");
                delete this._params.direct;
                // 处理keepHash参数
                this._keepHash = (this._params.keepHash == "true");
                delete this._params.keepHash;
                // 如果keepHash不是true，则移除哈希值
                if (!this._keepHash)
                    window.location.hash = "";
            }
        }
        Object.defineProperty(Hash.prototype, "hash", {
            /**
             * 获取原始的哈希字符串
             *
             * @readonly
             * @type {string}
             * @memberof Hash
             */
            get: function () {
                return this._hash;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Hash.prototype, "moduleName", {
            /**
             * 获取模块名
             *
             * @readonly
             * @type {string}
             * @memberof Hash
             */
            get: function () {
                return this._moduleName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Hash.prototype, "params", {
            /**
             * 获取传递给模块的参数
             *
             * @readonly
             * @type {{[key:string]:string}}
             * @memberof Hash
             */
            get: function () {
                return this._params;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Hash.prototype, "direct", {
            /**
             * 获取是否直接跳转模块
             *
             * @readonly
             * @type {boolean}
             * @memberof Hash
             */
            get: function () {
                return this._direct;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Hash.prototype, "keepHash", {
            /**
             * 获取是否保持哈希值
             *
             * @readonly
             * @type {boolean}
             * @memberof Hash
             */
            get: function () {
                return this._keepHash;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 获取指定哈希参数
         *
         * @param {string} key 参数名
         * @returns {string} 参数值
         * @memberof Hash
         */
        Hash.prototype.getParam = function (key) {
            return this._params[key];
        };
        Hash = __decorate([
            Injector_13.Injectable,
            __metadata("design:paramtypes", [])
        ], Hash);
        return Hash;
    }());
    exports.default = Hash;
    /** 再额外导出一个单例 */
    exports.hash = Core_17.core.getInject(Hash);
});
define("engine/env/Query", ["require", "exports", "core/Core", "core/injector/Injector"], function (require, exports, Core_18, Injector_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-05
     * @modify date 2017-09-05
     *
     * Query类记录通过GET参数传递给框架的参数字典
    */
    var Query = /** @class */ (function () {
        function Query() {
            this._params = {};
            var query = window.location.search.substr(1);
            var vars = query.split('&');
            for (var i = 0, len = vars.length; i < len; i++) {
                var pair = vars[i].split('=', 2);
                if (pair.length != 2 || !pair[0])
                    continue;
                var name = pair[0];
                var value = pair[1];
                name = decodeURIComponent(name);
                value = decodeURIComponent(value);
                // decode twice for ios
                name = decodeURIComponent(name);
                value = decodeURIComponent(value);
                this._params[name] = value;
            }
        }
        /**
         * 获取GET参数
         *
         * @param {string} key 参数key
         * @returns {string} 参数值
         * @memberof Query
         */
        Query.prototype.getParam = function (key) {
            return this._params[key];
        };
        Query = __decorate([
            Injector_14.Injectable,
            __metadata("design:paramtypes", [])
        ], Query);
        return Query;
    }());
    exports.default = Query;
    /** 再额外导出一个单例 */
    exports.query = Core_18.core.getInject(Query);
});
define("engine/version/Version", ["require", "exports", "core/Core", "Injector", "utils/URLUtil"], function (require, exports, Core_19, Injector_15, URLUtil_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-21
     * @modify date 2017-09-21
     *
     * 管理文件哈希版本号
    */
    var Version = /** @class */ (function () {
        function Version() {
            this._hashDict = {};
        }
        /**
         * 初始化哈希版本工具
         *
         * @param {()=>void} handler 回调
         * @memberof Version
         */
        Version.prototype.initialize = function (handler) {
            // 去加载version.cfg
            var request = null;
            if (window["XMLHttpRequest"]) {
                // code for IE7+, Firefox, Chrome, Opera, Safari
                request = new XMLHttpRequest();
            }
            else if (window["ActiveXObject"]) {
                // code for IE6, IE5
                request = new ActiveXObject("Microsoft.XMLHTTP");
            }
            // 注册回调函数
            request.onreadystatechange = callback;
            // 设置连接信息
            request.open("GET", "version.cfg?v=" + new Date().getTime(), true);
            // 发送数据，开始和服务器进行交互
            request.send();
            // 回调函数,不同相应状态进行处理
            function callback(evt) {
                var request = evt.target;
                //判断对象状态是交互完成，接收服务器返回的数据
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        var fileName = request["fileName"];
                        var responseText = request.responseText;
                        var lines = responseText.split("\n");
                        for (var i in lines) {
                            var line = lines[i];
                            var arr = line.split("  ");
                            if (arr.length == 2) {
                                var key = arr[1].substr(2);
                                var value = arr[0];
                                this._hashDict[key] = value;
                            }
                        }
                    }
                    handler();
                }
            }
        };
        /**
         * 获取文件哈希值，如果没有文件哈希值则返回null
         *
         * @param {string} url 文件的URL
         * @returns {string} 文件的哈希值，或者null
         * @memberof Version
         */
        Version.prototype.getHash = function (url) {
            url = URLUtil_2.trimURL(url);
            var result = null;
            for (var path in this._hashDict) {
                if (url.indexOf(path) >= 0) {
                    result = this._hashDict[path];
                    break;
                }
            }
            return result;
        };
        /**
         * 将url转换为哈希版本url
         *
         * @param {string} url 原始url
         * @returns {string} 哈希版本url
         * @memberof Version
         */
        Version.prototype.wrapHashUrl = function (url) {
            var hash = this.getHash(url);
            if (hash != null) {
                url = this.joinVersion(url, hash);
            }
            return url;
        };
        /**
         * 添加-r_XXX形式版本号
         *
         * @param {string} url
         * @param {string} version 版本号，以数字和小写字母组成
         * @returns {string} 加版本号后的url，如果没有查到版本号则返回原始url
         * @memberof Version
         */
        Version.prototype.joinVersion = function (url, version) {
            if (version == null)
                return url;
            // 去掉version中的非法字符
            version = version.replace(/[^0-9a-z]+/ig, "");
            // 插入版本号
            var reg = /([a-zA-Z]+:\/+[^\/\?#]+\/[^\?#]+)\.([^\?]+)(\?.+)?/;
            var result = reg.exec(url);
            if (result != null) {
                url = result[1] + "-r_" + version + "." + result[2] + (result[3] || "");
            }
            return url;
        };
        /**
         * 移除-r_XXX形式版本号
         *
         * @param {string} url url
         * @returns {string} 移除版本号后的url
         * @memberof Version
         */
        Version.prototype.removeVersion = function (url) {
            // 去掉-r_XXX版本号，如果有
            url = url.replace(/\-r_[a-z0-9]+\./ig, ".");
            return url;
        };
        Version = __decorate([
            Injector_15.Injectable
        ], Version);
        return Version;
    }());
    exports.default = Version;
    /** 再额外导出一个单例 */
    exports.version = Core_19.core.getInject(Version);
});
define("engine/net/HTTPMethod", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("engine/net/policies/HTTPRequestPolicy", ["require", "exports", "utils/URLUtil", "engine/net/NetManager"], function (require, exports, URLUtil_3, NetManager_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HTTPRequestPolicy = /** @class */ (function () {
        function HTTPRequestPolicy() {
        }
        /**
         * 发送请求逻辑
         *
         * @param {IHTTPRequestParams} params HTTP请求数据
         * @memberof HTTPRequestPolicy
         */
        HTTPRequestPolicy.prototype.sendRequest = function (request) {
            var params = request.__params;
            var retryTimes = params.retryTimes || 2;
            var timeout = params.timeout || 10000;
            var method = params.method || "GET";
            var timeoutId = 0;
            // 取到url
            var url = URLUtil_3.wrapHost(params.path, params.host);
            // 合法化一下protocol
            url = URLUtil_3.validateProtocol(url);
            // 生成并初始化xhr
            var xhr = (window["XMLHttpRequest"] ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
            xhr.onreadystatechange = onReadyStateChange;
            // 发送
            send();
            function send() {
                // 根据发送方式组织数据格式
                switch (method) {
                    case "POST":
                        // POST目前规定为JSON格式发送
                        xhr.open(method, url, true);
                        xhr.setRequestHeader("Content-Type", "application/json");
                        xhr.setRequestHeader("withCredentials", "true");
                        xhr.send(JSON.stringify(params.data));
                        break;
                    case "GET":
                        // 将数据添加到url上
                        url = URLUtil_3.joinQueryParams(url, params.data);
                        xhr.open(method, url, true);
                        xhr.setRequestHeader("withCredentials", "true");
                        xhr.send(null);
                        break;
                    default:
                        throw new Error("暂不支持的HTTP Method：" + method);
                }
            }
            function onReadyStateChange() {
                switch (xhr.readyState) {
                    case 2:// 已经发送，开始计时
                        timeoutId = setTimeout(abortAndRetry, timeout);
                        break;
                    case 4:// 接收完毕
                        // 停止计时
                        timeoutId && clearTimeout(timeoutId);
                        timeoutId = 0;
                        try {
                            if (xhr.status == 200) {
                                // 成功回调
                                var result = JSON.parse(xhr.responseText);
                                NetManager_3.netManager.__onResponse(request.__params.response.type, result, request);
                            }
                            else if (retryTimes > 0) {
                                // 没有超过重试上限则重试
                                abortAndRetry();
                            }
                            else {
                                // 出错回调
                                var err = new Error(xhr.status + " " + xhr.statusText);
                                NetManager_3.netManager.__onError(err, request);
                            }
                        }
                        catch (err) {
                            console.error(err.message);
                        }
                        break;
                }
            }
            function abortAndRetry() {
                // 重试次数递减
                retryTimes--;
                // 中止xhr
                xhr.abort();
                // 重新发送
                send();
            }
        };
        return HTTPRequestPolicy;
    }());
    exports.HTTPRequestPolicy = HTTPRequestPolicy;
    /** 再额外导出一个实例 */
    exports.default = new HTTPRequestPolicy();
});
define("engine/Engine", ["require", "exports", "core/Core", "core/injector/Injector", "engine/injector/Injector", "engine/bridge/BridgeManager", "engine/bridge/BridgeMessage", "engine/module/ModuleManager", "engine/env/Environment", "engine/version/Version", "engine/module/ModuleMessage"], function (require, exports, Core_20, Injector_16, Injector, BridgeManager_2, BridgeMessage_2, ModuleManager_2, Environment_1, Version_1, ModuleMessage_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Injector;
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * Engine模组是开发框架的引擎部分，包括业务模块系统、应用程序启动和初始化、弹窗和场景管理器等与项目开发相关的逻辑都在这个模组中
     * 这个模组的逻辑都高度集成在子模组中了，因此也只是收集相关子模组
    */
    var Engine = /** @class */ (function () {
        function Engine() {
        }
        /**
         *
         *
         * @param {IModuleConstructor} firstModule 首个模块
         * @param {(Element|string)} loadElement 程序启动前的Loading DOM节点，当首个模块显示出来后会移除该DOM节点
         * @memberof Engine
         */
        /**
         * 初始化Engine
         *
         * @param {IInitParams} params 初始化参数
         * @memberof Engine
         */
        Engine.prototype.initialize = function (params) {
            var _this = this;
            this._firstModule = params.firstModule;
            // 加载页
            this._loadElement = (typeof params.loadElement == "string" ? document.getElementById(params.loadElement) : params.loadElement);
            // 初始化环境参数
            Environment_1.environment.initialize(params.env, params.hostsDict, params.cdnsDict);
            // 初始化版本号管理器
            Version_1.version.initialize(function () {
                // 监听Bridge初始化完毕事件，显示第一个模块
                Core_20.core.listen(BridgeMessage_2.default.BRIDGE_ALL_INIT, _this.onAllBridgesInit, _this);
                // 注册并初始化表现层桥实例
                BridgeManager_2.bridgeManager.registerBridge.apply(BridgeManager_2.bridgeManager, params.bridges);
            });
        };
        Engine.prototype.onAllBridgesInit = function () {
            // 注销监听
            Core_20.core.unlisten(BridgeMessage_2.default.BRIDGE_ALL_INIT, this.onAllBridgesInit, this);
            // 监听首个模块开启
            Core_20.core.listen(ModuleMessage_2.default.MODULE_CHANGE, this.onModuleChange, this);
            // 打开首个模块
            ModuleManager_2.moduleManager.open(this._firstModule);
        };
        Engine.prototype.onModuleChange = function (from) {
            // 注销监听
            Core_20.core.unlisten(ModuleMessage_2.default.MODULE_CHANGE, this.onModuleChange, this);
            // 移除loadElement显示
            if (this._loadElement) {
                var parent = this._loadElement.parentElement;
                parent && parent.removeChild(this._loadElement);
            }
        };
        Engine = __decorate([
            Injector_16.Injectable
        ], Engine);
        return Engine;
    }());
    exports.default = Engine;
    /** 再额外导出一个单例 */
    exports.engine = Core_20.core.getInject(Engine);
});
define("Olympus", ["require", "exports", "engine/Engine"], function (require, exports, Engine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-18
     * @modify date 2017-09-18
     *
     * Olympus框架便捷启动与框架外观模块
    */
    var Olympus = /** @class */ (function () {
        function Olympus() {
        }
        /**
         * 启动Olympus框架
         *
         * @static
         * @param {IInitParams} params 启动参数
         * @memberof Olympus
         */
        Olympus.startup = function (params) {
            // 初始化引擎模块
            Engine_1.engine.initialize(params);
        };
        return Olympus;
    }());
    exports.default = Olympus;
});
//# sourceMappingURL=Olympus.js.map