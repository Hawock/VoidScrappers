import { _decorator, Component, Button } from 'cc';
import { DEV } from 'cc/env';

const { ccclass, property } = _decorator;

@ccclass('OpenStoreDevtoolsButton')
export class OpenStoreDevtoolsButton extends Component {
    @property(Button)
    button: Button | null = null;

    private _refreshFn: (() => void) | null = null;

    onLoad() {
        const btn = this.button ?? this.getComponent(Button);
        btn?.node.on(Button.EventType.CLICK, this.onClick, this);
    }

    onDestroy() {
        const btn = this.button ?? this.getComponent(Button);
        btn?.node.off(Button.EventType.CLICK, this.onClick, this);
    }

    private onClick() {
        if (!DEV || typeof document === 'undefined') return;

        const existing = document.getElementById('pc-devtools');
        if (existing) {
            const isNowOpen = existing.classList.toggle('open');
            if (isNowOpen) {
                this._refreshFn?.();
            }
            return;
        }

        this.mountDevtools();
    }

    private mountDevtools() {
        document.getElementById('pc-devtools-style')?.remove();
        document.getElementById('pc-devtools')?.remove();

        const style = document.createElement('style');
        style.id = 'pc-devtools-style';
        style.textContent = `
            #pc-devtools {
                position: fixed;
                left: 50%;
                bottom: 20px;
                transform: translateX(-50%);
                width: min(1000px, calc(100vw - 40px));
                height: min(520px, calc(100vh - 40px));
                z-index: 999999;
                display: none;
                grid-template-columns: 200px 1fr;
                gap: 12px;
                padding: 12px 14px;
                box-sizing: border-box;
                border: 1px solid rgba(255, 255, 255, 0.16);
                border-radius: 10px;
                background: rgba(15, 17, 22, 0.96);
                box-shadow: 0 12px 36px rgba(0, 0, 0, 0.65);
                pointer-events: auto;
                font-family: Consolas, Monaco, monospace;
                font-size: 14px;
                color: #e5e7eb;
            }
            #pc-devtools.open { display: grid; }
            #pc-devtools-list {
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 6px;
                padding-right: 4px;
            }
            .pc-store-btn {
                text-align: left;
                padding: 7px 10px;
                border-radius: 6px;
                border: 1px solid rgba(255, 255, 255, 0.14);
                background: rgba(255, 255, 255, 0.05);
                color: #f3f4f6;
                font-family: inherit;
                font-size: 13.5px;
                cursor: pointer;
            }
            .pc-store-btn:hover { background: rgba(255, 255, 255, 0.11); }
            .pc-store-btn.active {
                border-color: #4ade80;
                background: rgba(74, 222, 128, 0.18);
                color: #bbf7d0;
            }
            #pc-devtools-main {
                display: flex;
                flex-direction: column;
                min-width: 0;
                min-height: 0;
            }
            #pc-devtools-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
                padding-bottom: 8px;
                margin-bottom: 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.12);
            }
            #pc-devtools-title { font-size: 15px; color: #93c5fd; }
            #pc-devtools-actions { display: flex; gap: 6px; }
            #pc-devtools-tree {
                flex: 1;
                min-height: 0;
                overflow-y: auto;
                padding: 8px 10px;
                border-radius: 6px;
                background: rgba(0, 0, 0, 0.45);
                line-height: 1.5;
            }
            .pc-node { user-select: text; }
            .pc-children {
                margin-left: 18px;
                padding-left: 8px;
                border-left: 1px solid rgba(255, 255, 255, 0.12);
                display: none;
            }
            .pc-node.expanded > .pc-children { display: block; }
            .pc-row-toggle {
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                border-radius: 4px;
                padding: 1px 3px;
            }
            .pc-row-toggle:hover { background: rgba(255, 255, 255, 0.08); }
            .pc-arrow {
                display: inline-block;
                width: 14px;
                color: #9ca3af;
                font-size: 11px;
                transition: transform 0.12s ease;
            }
            .pc-node.expanded > .pc-row-toggle > .pc-arrow { transform: rotate(90deg); }
            .pc-leaf { padding: 1px 3px 1px 18px; }
            .pc-key { color: #7dd3fc; }
            .pc-meta { color: #9ca3af; font-size: 13px; }
            .pc-str { color: #86efac; }
            .pc-num { color: #fcd34d; }
            .pc-bool { color: #f472b6; }
            .pc-null { color: #9ca3af; font-style: italic; }
        `;
        document.head.appendChild(style);

        const root = document.createElement('div');
        root.id = 'pc-devtools';
        root.className = 'open';
        root.innerHTML = `
            <div id="pc-devtools-list"></div>
            <div id="pc-devtools-main">
                <div id="pc-devtools-bar">
                    <strong id="pc-devtools-title">Store</strong>
                    <div id="pc-devtools-actions">
                        <button id="pc-devtools-refresh" class="pc-store-btn">Обновить</button>
                        <button id="pc-devtools-copy" class="pc-store-btn">Копировать</button>
                    </div>
                </div>
                <div id="pc-devtools-tree"></div>
            </div>
        `;
        document.body.appendChild(root);

        const listEl = root.querySelector('#pc-devtools-list') as HTMLElement;
        const titleEl = root.querySelector('#pc-devtools-title') as HTMLElement;
        const treeEl = root.querySelector('#pc-devtools-tree') as HTMLElement;
        let selectedId: string | null = null;
        let currentState: Record<string, unknown> = {};

        const getApi = () =>
            (window as any).__PINACOLADA_DEVTOOLS__ || (window.parent as any)?.__PINACOLADA_DEVTOOLS__;

        const createPrimitiveSpan = (val: unknown) => {
            const span = document.createElement('span');
            if (val === null || val === undefined) {
                span.className = 'pc-null';
                span.textContent = String(val);
            } else if (typeof val === 'string') {
                span.className = 'pc-str';
                span.textContent = `"${val}"`;
            } else if (typeof val === 'number') {
                span.className = 'pc-num';
                span.textContent = String(val);
            } else if (typeof val === 'boolean') {
                span.className = 'pc-bool';
                span.textContent = String(val);
            } else {
                span.className = 'pc-str';
                span.textContent = String(val);
            }
            return span;
        };

        const buildTreeElement = (key: string, val: unknown): HTMLElement => {
            const isArray = Array.isArray(val);
            const isObj = val !== null && typeof val === 'object' && !isArray;

            if (!isArray && !isObj) {
                const leaf = document.createElement('div');
                leaf.className = 'pc-node pc-leaf';
                const kSpan = document.createElement('span');
                kSpan.className = 'pc-key';
                kSpan.textContent = `${key}: `;
                leaf.appendChild(kSpan);
                leaf.appendChild(createPrimitiveSpan(val));
                return leaf;
            }

            const entries: [string, unknown][] = isArray
                ? (val as unknown[]).map((item, idx) => [String(idx), item])
                : Object.entries(val as Record<string, unknown>);

            const node = document.createElement('div');
            node.className = 'pc-node';

            const toggle = document.createElement('div');
            toggle.className = 'pc-row-toggle';

            const arrow = document.createElement('span');
            arrow.className = 'pc-arrow';
            arrow.textContent = '▶';

            const kSpan = document.createElement('span');
            kSpan.className = 'pc-key';
            kSpan.textContent = `${key}: `;

            const meta = document.createElement('span');
            meta.className = 'pc-meta';
            meta.textContent = isArray ? `Array(${entries.length})` : `Object(${entries.length})`;

            toggle.appendChild(arrow);
            toggle.appendChild(kSpan);
            toggle.appendChild(meta);

            const childrenBox = document.createElement('div');
            childrenBox.className = 'pc-children';

            let renderedChildren = false;
            toggle.onclick = (e) => {
                e.stopPropagation();
                if (!renderedChildren) {
                    for (const [childKey, childVal] of entries) {
                        childrenBox.appendChild(buildTreeElement(childKey, childVal));
                    }
                    renderedChildren = true;
                }
                node.classList.toggle('expanded');
            };

            node.appendChild(toggle);
            node.appendChild(childrenBox);
            return node;
        };

        const renderSelected = () => {
            const api = getApi();
            treeEl.innerHTML = '';
            if (!api || !selectedId) {
                titleEl.textContent = 'Нет стора';
                currentState = {};
                return;
            }
            const snap = api.get(selectedId);
            currentState = snap?.state ?? {};
            titleEl.textContent = selectedId;

            const rootEntries = Object.entries(currentState);
            if (rootEntries.length === 0) {
                treeEl.textContent = '{}';
                return;
            }
            for (const [k, v] of rootEntries) {
                treeEl.appendChild(buildTreeElement(k, v));
            }
            treeEl.scrollTop = 0;
        };

        const renderList = () => {
            const api = getApi();
            const ids: string[] = api?.ids ? api.ids() : [];
            if (!selectedId || !ids.includes(selectedId)) {
                selectedId = ids[0] ?? null;
            }

            listEl.innerHTML = '';
            ids.forEach((id) => {
                const btn = document.createElement('button');
                btn.className = 'pc-store-btn' + (id === selectedId ? ' active' : '');
                btn.textContent = id;
                btn.onclick = () => {
                    selectedId = id;
                    renderList();
                    renderSelected();
                };
                listEl.appendChild(btn);
            });
            renderSelected();
        };

        this._refreshFn = renderList;

        (root.querySelector('#pc-devtools-refresh') as HTMLElement).onclick = () => renderList();
        (root.querySelector('#pc-devtools-copy') as HTMLElement).onclick = () => {
            navigator.clipboard?.writeText(JSON.stringify(currentState, null, 2));
        };

        renderList();
    }
}