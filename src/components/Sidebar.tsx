import { FolderOpen, Settings2, Package, LogOut } from 'lucide-react';
import { useEffect } from 'react';
import { useStore } from '../store';
import { SCHEMA_CATEGORIES } from '../lib/schemas';
import { pickDirectory, generateGDScript, exportResource } from '../lib/fs';
import type { Schema } from '../types';

export function Sidebar() {
	const { projectPath, resources, selectedType, setSelectedType, resourceFolder, setResourceFolder, setEditingSchema, setProjectPath, schemas } = useStore();

	const handleExportAll = async () => {
		if (!projectPath) return;
		if (!confirm('Isso irá re-exportar TODOS os recursos (.tres) e scripts (.gd) do projeto. Continuar?')) return;

		// Obtém estado atual (pode ter mudado)
		const currentSchemas = useStore.getState().schemas;
		const currentResources = useStore.getState().resources;
		const currentFolder = useStore.getState().resourceFolder;

		try {
			let resCount = 0;
			let scriptCount = 0;

			for (const schema of currentSchemas) {
				// Exporta GDScript
				await generateGDScript(schema, projectPath, currentFolder);
				scriptCount++;

				// Exporta Resources
				const list = currentResources[schema.type] || [];
				for (const res of list) {
					await exportResource(res, schema, projectPath, currentFolder);
					resCount++;
				}
			}
			alert(`Exportação concluída com sucesso!\n\n📄 Scripts gerados: ${scriptCount}\n📦 Recursos exportados: ${resCount}`);
		} catch (error) {
			alert(`Erro durante a exportação:\n${error}`);
		}
	};

	const handleSelectResourceFolder = async () => {
		if (!projectPath) return;

		const selected = await pickDirectory();
		if (selected) {
			// Normaliza paths para evitar problemas com barras (Windows vs Unix)
			const normalize = (p: string) => p.replace(/\\/g, '/').replace(/\/$/, '');
			const proj = normalize(projectPath);
			const sel = normalize(selected);

			let relative = sel;

			// Se a pasta selecionada estiver dentro do projeto, usa caminho relativo
			if (sel.startsWith(proj)) {
				relative = sel.substring(proj.length).replace(/^\//, '');
			}

			// Se for a própria raiz ou vazio
			if (!relative) relative = '.';

			localStorage.setItem(`grm.folder.${projectPath}`, relative);
			setResourceFolder(relative);
		}
	};

	// Carrega folder salvo ao iniciar
	useEffect(() => {
		if (projectPath) {
			const saved = localStorage.getItem(`grm.folder.${projectPath}`);
			if (saved) setResourceFolder(saved);
			else setResourceFolder('resources');
		}
	}, [projectPath, setResourceFolder]);

	return (
		<aside className='flex flex-col w-56 h-full border-r border-bg-border bg-bg-panel shrink-0'>
			{/* 1. Header: Ações do Projeto */}
			<div className='flex items-center justify-between px-4 py-3 border-b border-bg-border shrink-0 bg-bg-panel z-10'>
				<h1 className='font-bold text-sm tracking-wide text-text-muted'>RESOURCES</h1>
				<div className='flex items-center gap-1 shrink-0'>
					<button
						onClick={() => setProjectPath('')} // LogOut / Change Project
						className='p-1.5 rounded text-text-muted hover:text-red-400 hover:bg-bg-hover transition-colors'
						title='Fechar Projeto'
					>
						<LogOut size={16} />
					</button>
					<button
						onClick={() => setEditingSchema(true)}
						className='p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors'
						title='Editar Schemas'
					>
						<Settings2 size={16} />
					</button>
				</div>
			</div>

			{/* 2. Lista de Recursos (Scrollable) */}
			<nav className='flex-1 overflow-y-auto py-2 space-y-1'>
				{Object.entries(
					schemas.reduce(
						(acc, schema: Schema) => {
							let category = 'Custom';
							for (const cat of SCHEMA_CATEGORIES) {
								if (cat.types.includes(schema.type)) {
									category = cat.label;
									break;
								}
							}
							if (!acc[category]) acc[category] = [];
							acc[category].push(schema);
							return acc;
						},
						{} as Record<string, Schema[]>
					)
				).map(([label, list]) => (
					<div key={label} className='mb-2'>
						<p className='px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted/70'>{label}</p>
						<div className='space-y-0.5'>
							{list.map((schema) => {
								const active = selectedType === schema.type;
								// Conta quantos recursos existem desse tipo
								const count = (resources[schema.type] || []).length;

								return (
									<button
										key={schema.type}
										onClick={() => setSelectedType(schema.type)}
										className={`w-full flex items-center justify-between px-4 py-1.5 text-xs font-mono transition-all group
                        ${active ? 'bg-bg-active text-text-primary border-r-2' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
										style={{ borderRightColor: active ? schema.color : 'transparent' }}
									>
										<div className='flex items-center gap-2.5 overflow-hidden'>
											<span className='w-2 h-2 rounded-full shrink-0 opacity-80' style={{ backgroundColor: schema.color }} />
											<span className='truncate font-medium'>{schema.label || schema.type}</span>
										</div>
										{count > 0 && <span className={`text-[10px] opacity-40 ${active ? 'text-text-primary' : 'text-text-muted'}`}>{count}</span>}
									</button>
								);
							})}
						</div>
					</div>
				))}
			</nav>

			{/* 3. Footer: Global Actions */}
			<div className='p-3 border-t border-bg-border bg-bg-panel/50 shrink-0 space-y-2'>
				{/* Folder Selector */}
				<div className='flex flex-col gap-1'>
					<span className='text-[10px] font-bold uppercase tracking-widest text-text-muted/50 px-1'>RESOURCES</span>
					<button
						onClick={handleSelectResourceFolder}
						className='flex items-center gap-2 w-full px-2 py-1.5 bg-bg-base border border-bg-border rounded text-xs text-text-secondary hover:text-text-primary hover:border-text-muted transition-all'
						title={`Caminho atual: ${resourceFolder}`}
					>
						<FolderOpen size={14} className='shrink-0' />
						<span className='truncate font-mono flex-1 text-left'>{resourceFolder || './'}</span>
					</button>
				</div>

				{/* Export All Button */}
				<button
					onClick={handleExportAll}
					className='w-full flex items-center justify-center gap-2 px-3 py-2 bg-bg-base border border-bg-border rounded text-xs font-medium text-text-muted hover:text-green-400 hover:border-green-400/30 hover:bg-green-400/5 transition-all group'
					title='Exportar todos os recursos e scripts'
				>
					<Package size={14} className='group-hover:scale-110 transition-transform' />
					<span>EXPORT ALL</span>
				</button>
			</div>
		</aside>
	);
}

