import { getSettings } from '@/lib/actions/settings';
import SettingsForm from '@/components/settings/SettingsForm';

export default async function SettingsPage() {
    const settings = await getSettings();

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Opciones</h2>
            <SettingsForm settings={settings} />
        </div>
    );
}
